import { PDFParse } from "pdf-parse";
import { OpenAI } from "openai";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-memory cache to store analysis results by file hash
// Key: file hash (SHA-256), Value: analysis result
const analysisCache = new Map();

/**
 * Generate SHA-256 hash of file buffer
 * @param {Buffer} fileBuffer - The file buffer to hash
 * @returns {string} - Hexadecimal hash string
 */
const generateFileHash = (fileBuffer) => {
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
};

/**
 * Helper function to call OpenAI API with retry logic
 * @param {Function} apiCall - The OpenAI API call function
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise} - The API response
 */
const callOpenAIWithRetry = async (apiCall, maxRetries = 3) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // If it's a rate limit error (429), wait and retry
      if (error.status === 429) {
        const retryAfter = error.headers?.["retry-after"]
          ? parseInt(error.headers["retry-after"]) * 1000
          : Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s

        console.log(
          `OpenAI rate limit hit. Retrying in ${retryAfter / 1000}s (attempt ${
            attempt + 1
          }/${maxRetries})...`
        );

        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryAfter));
          continue;
        }
      }

      // For other errors, don't retry
      throw error;
    }
  }

  throw lastError;
};

export const analyzeResume = async (
  fileBuffer,
  fileName,
  recordOpenAICall = null
) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured");
    }

    // Generate hash of the file to identify duplicates
    const fileHash = generateFileHash(fileBuffer);
    console.log("file hash", fileHash);
    console.log("fileName", fileName);

    // Check if we've analyzed this file before
    if (analysisCache.has(fileHash)) {
      console.log(
        `Returning cached analysis for file: ${fileName} (hash: ${fileHash.substring(
          0,
          8
        )}...)`
      );
      // Return cached result - no OpenAI API call needed, so don't record it
      return { ...analysisCache.get(fileHash), cached: true };
    }

    console.log(
      `Processing new resume: ${fileName} (hash: ${fileHash.substring(
        0,
        8
      )}...)`
    );

    // Parse PDF and extract text
    let resumeText;
    let pdfParser;
    try {
      // Convert Buffer to Uint8Array as required by PDFParse
      const uint8Array = new Uint8Array(fileBuffer);
      
      // Create a new PDFParse instance with the file data
      pdfParser = new PDFParse({ data: uint8Array });
      
      // Extract text using getText() method (returns TextResult object)
      const textResult = await pdfParser.getText();
      resumeText = textResult.text || "";
      
      // Clean up the parser instance
      await pdfParser.destroy();
      
      const trimmedText = resumeText.trim();
      if (!trimmedText || trimmedText.length < 50) {
        console.warn(
          `PDF parsing returned insufficient text (${trimmedText.length} chars) for file: ${fileName}`
        );
        throw new Error(
          "Unable to extract text from PDF. The PDF may be image-based (scanned) or corrupted. " +
            "Please ensure the PDF contains selectable text, not just images."
        );
      }

      console.log(
        `Extracted ${trimmedText.length} characters from PDF: ${fileName}`
      );
    } catch (pdfError) {
      // Clean up parser if it was created
      if (pdfParser) {
        try {
          await pdfParser.destroy();
        } catch (destroyError) {
          // Ignore destroy errors
        }
      }

      console.error(`PDF parsing error for file ${fileName}:`, pdfError);

      // If it's our custom validation error, throw it as-is
      if (pdfError.message?.includes("Unable to extract text")) {
        throw pdfError;
      }

      // Otherwise, wrap the PDF parsing error
      throw new Error(
        `Failed to parse PDF: ${
          pdfError.message || "PDF may be corrupted or in an unsupported format"
        }`
      );
    }

    // Record this as an actual OpenAI API call for rate limiting
    // Only record after successful PDF parsing, when we're actually going to make an API call
    if (recordOpenAICall) {
      recordOpenAICall();
    }

    // Call OpenAI API with retry logic for rate limit handling
    const response = await callOpenAIWithRetry(async () => {
      return await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content:
              "You are an ATS resume reviewer. Analyze resumes and provide structured feedback. Return only valid JSON matching the required schema.",
          },
          {
            role: "user",
            content: `Analyze this resume and return JSON with:
- atsScore: number (0-100) - Overall ATS compatibility score
- strengths: array of strings - What the resume does well
- weaknesses: array of strings - Areas that need improvement
- suggestions: array of strings - Actionable recommendations

Resume:
${resumeText}`,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "resume_analysis",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                atsScore: {
                  type: "number",
                  minimum: 0,
                  maximum: 100,
                },
                strengths: {
                  type: "array",
                  items: { type: "string" },
                },
                weaknesses: {
                  type: "array",
                  items: { type: "string" },
                },
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["atsScore", "strengths", "weaknesses", "suggestions"],
            },
          },
        },
      });
    });

    const analysisResult = JSON.parse(response.output_text);

    // Cache the analysis result for future requests
    analysisCache.set(fileHash, analysisResult);
    console.log(
      `Cached analysis result for file: ${fileName} (hash: ${fileHash.substring(
        0,
        8
      )}...)`
    );

    return { ...analysisResult, cached: false };
  } catch (error) {
    console.error("Error analyzing resume:", error);

    // Handle specific OpenAI API errors
    let errorMessage = "Failed to analyze resume";
    let statusCode = 500;

    if (
      error.status === 413 ||
      error.message?.includes("413") ||
      error.message?.includes("exceeds")
    ) {
      errorMessage =
        "File size exceeds OpenAI's limit (512MB). Please compress your PDF or use a smaller file.";
      statusCode = 413;
    } else if (error.status === 400) {
      errorMessage = error.message || "Invalid request to OpenAI API";
      statusCode = 400;
    } else if (error.status === 429) {
      errorMessage = "OpenAI API rate limit exceeded. Please try again later.";
      statusCode = 429;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

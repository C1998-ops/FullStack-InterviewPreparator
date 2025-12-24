import axios from "axios";
import React, { useState, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router";
interface AnalysisResult {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

const ResumeAnalyser: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    resetTime: number | null;
  } | null>(null);
  const { token, isAuthenticated } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  // Toast notification system
  const showToast = (message: string, type: Toast["type"] = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  // Auto-dismiss toasts
  useEffect(() => {
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 5000);
    return () => clearTimeout(timer);
  }, [toasts]);
  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      showToast("Please upload a PDF file", "error");
      return;
    }

    // Validate file size (50MB limit)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      showToast(
        `File size (${fileSizeMB.toFixed(
          2
        )}MB) exceeds the 10MB limit. Please compress or use a smaller file.`,
        "error"
      );
      return;
    }

    setSelectedFile(file);
    setAnalysisResult(null); // Reset previous results
    showToast("File selected successfully!", "success");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };
  function handleLogin() {
    if (isAuthenticated) {
      const returnUrl = sessionStorage.getItem("return_url") || "/";
      navigate(returnUrl, { replace: true });
    } else {
      sessionStorage.setItem("return_url", location.pathname + location.search);
      navigate("/login", { replace: true });
    }
  }

  const handleAnalyzeResume = async () => {
    if (!isAuthenticated) {
      handleLogin();
      return;
    }
    if (!selectedFile) {
      showToast("Please upload a resume first", "warning");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append(
        "resume",
        selectedFile as File,
        selectedFile?.name || "Attached-Resume.pdf"
      );

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await axios.post("/api/resume-analyser", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!result.data) {
        showToast("Failed to analyze resume", "error");
        return;
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Check for rate limit headers
      const remaining = result.headers["X-RateLimit-Remaining"];
      const resetTime = result.headers["X-RateLimit-Reset"];
      if (remaining !== null && resetTime !== null) {
        setRateLimitInfo({
          remaining: parseInt(remaining as string, 10),
          resetTime: parseInt(resetTime as string, 10),
        });
      }

      if (result.status !== 200 || !result.data) {
        const errorData = result.data as unknown as { error: string };
        showToast(errorData.error || "Failed to analyze resume", "error");
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      const data = result.data as unknown as AnalysisResult;
      setAnalysisResult(data);
      showToast("Resume analyzed successfully!", "success");

      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.querySelector(".analysis-results");
        resultsElement?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to analyze resume",
        "error"
      );
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
    // // Simulate API call
    // setTimeout(() => {
    //   // Mock analysis result
    //   const mockResult: AnalysisResult = {
    //     atsScore: 78,
    //     suggestions: [
    //       "Add more relevant keywords from the job description",
    //       "Include quantifiable achievements in your experience section",
    //       "Optimize your skills section to match job requirements",
    //       "Consider adding a professional summary at the top",
    //       "Ensure consistent formatting throughout the document",
    //       "Add industry-specific certifications if applicable",
    //     ],
    //   };
    //   setAnalysisResult(mockResult);
    //   setIsAnalyzing(false);
    // }, 3000);
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      {/* ATS Score Skeleton */}
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
        <div className="h-7 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/3 mb-6"></div>
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full"></div>
            <div className="h-4 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full w-3/4"></div>
          </div>
        </div>
      </div>
      {/* Analysis Sections Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100"
          >
            <div className="h-7 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="h-4 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-full"
                  style={{ animationDelay: `${j * 100}ms` }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Toast Component
  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`transform transition-all duration-300 ease-in-out animate-slide-in-right rounded-lg shadow-lg p-4 flex items-start gap-3 ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : toast.type === "error"
              ? "bg-red-50 border border-red-200 text-red-800"
              : toast.type === "warning"
              ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
              : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}
        >
          <span className="text-xl shrink-0">
            {toast.type === "success"
              ? "✅"
              : toast.type === "error"
              ? "❌"
              : toast.type === "warning"
              ? "⚠️"
              : "ℹ️"}
          </span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="resume-analyser min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <ToastContainer />
      <div className="content max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-12">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            📄 Resume Assistant
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Get instant AI-powered feedback on your resume. Optimize for ATS
            systems and improve your chances of landing interviews.
          </p>
          {!isAuthenticated && (
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm md:text-base text-blue-800 font-medium">
                🔒 <span className="font-semibold">Login required</span> to
                analyze your resume.
                <button
                  onClick={handleLogin}
                  className="ml-2 text-blue-600 hover:text-blue-700 underline font-semibold"
                >
                  Sign in here
                </button>
              </p>
            </div>
          )}
        </div>

        <div className="resume-analyser-content space-y-6 md:space-y-8">
          {/* Upload Box */}
          <div
            className={`upload-box border-2 border-dashed rounded-2xl p-6 md:p-12 text-center transition-all duration-300 transform ${
              isDragging
                ? "border-blue-500 bg-linear-to-br from-blue-50 to-blue-100 scale-[1.02] shadow-xl"
                : selectedFile
                ? "border-green-400 bg-linear-to-br from-green-50 to-emerald-50 shadow-lg"
                : "border-gray-300 bg-white/80 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              id="resume-file"
              onChange={handleFileInputChange}
            />

            {selectedFile ? (
              <div className="space-y-4 md:space-y-5 animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-green-100 mb-2">
                  <span className="text-4xl md:text-5xl">✅</span>
                </div>
                <div>
                  <p className="text-base md:text-lg font-semibold text-gray-800 wrap-break-word mb-2">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <label
                  htmlFor="resume-file"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer font-medium text-sm md:text-base transition-colors underline decoration-2 underline-offset-2"
                >
                  <span>Change file</span>
                  <span>↻</span>
                </label>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 md:max-w-xl rounded-full bg-linear-to-br from-blue-100 to-purple-100 mb-2">
                  <span className="text-4xl md:text-5xl">📄</span>
                </div>
                <div>
                  <p className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                    Drag & drop your resume here
                  </p>
                  <p className="text-sm md:text-base text-gray-500 font-medium">
                    or
                  </p>
                </div>
                <label
                  htmlFor="resume-file"
                  className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-3 md:py-6 rounded-xl font-semibold text-sm md:text-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer shadow-lg"
                >
                  <span>Browse Files</span>
                  <span>📁</span>
                </label>
                <p className="text-xs text-gray-400 mt-3 font-medium">
                  PDF files only • Max 10MB
                </p>
              </div>
            )}
          </div>

          {/* Analyze Button & Progress */}
          <div className="flex flex-col items-center gap-4">
            {!isAuthenticated ? (
              <div className="w-full md:w-auto text-center">
                <button
                  onClick={handleLogin}
                  className="relative w-full md:w-auto px-8 md:px-12 py-4 md:py-5 rounded-xl font-bold text-base md:text-lg transition-all transform bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 hover:shadow-2xl shadow-lg"
                >
                  <span className="flex items-center gap-2 justify-center">
                    <span>🔐</span>
                    Login to Analyze Resume
                  </span>
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  You need to be logged in to use this feature
                </p>
              </div>
            ) : (
              <button
                onClick={handleAnalyzeResume}
                disabled={!selectedFile || isAnalyzing}
                className={`relative w-full md:w-auto px-8 md:px-12 py-4 md:py-5 rounded-xl font-bold text-base md:text-lg transition-all transform ${
                  !selectedFile || isAnalyzing
                    ? "opacity-50 cursor-not-allowed bg-gray-400"
                    : "bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 hover:shadow-2xl shadow-lg"
                }`}
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing Resume...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>🚀</span>
                    Analyze Resume
                  </span>
                )}
              </button>
            )}

            {/* Progress Bar */}
            {isAnalyzing && (
              <div className="w-full max-w-md">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Processing your resume... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Rate Limit Info */}
            {rateLimitInfo && rateLimitInfo.remaining !== null && (
              <div className="text-xs text-gray-500 text-center">
                {rateLimitInfo.remaining > 0 ? (
                  <span>Remaining analyses: {rateLimitInfo.remaining}</span>
                ) : (
                  <span className="text-orange-600 font-medium">
                    Rate limit reached. Please try again later.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Loading Skeleton */}
          {isAnalyzing && <LoadingSkeleton />}

          {/* Results Cards */}
          {analysisResult && !isAnalyzing && (
            <div className="analysis-results space-y-6 md:space-y-8 mt-8 md:mt-12 animate-fade-in">
              {/* ATS Score Card */}
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                    ATS Score
                  </h3>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:gap-8 gap-6">
                  <div className="flex shrink-0">
                    <div
                      className={`relative w-32 h-32 md:w-40 md:h-40 mx-auto ${
                        analysisResult.atsScore >= 80
                          ? "text-green-500"
                          : analysisResult.atsScore >= 60
                          ? "text-blue-500"
                          : "text-orange-500"
                      }`}
                    >
                      <svg className="transform -rotate-90 w-full h-full">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="opacity-20"
                        />
                        <circle
                          cx="50%"
                          cy="50%"
                          r="45%"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 45} ${
                            2 * Math.PI * 45
                          }`}
                          strokeDashoffset={`${
                            2 *
                            Math.PI *
                            45 *
                            (1 - analysisResult.atsScore / 100)
                          }`}
                          className="transition-all duration-1000 ease-out"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-bold">
                          {analysisResult.atsScore}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="w-full bg-gray-200 rounded-full h-4 md:h-5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          analysisResult.atsScore >= 80
                            ? "bg-linear-to-r from-green-500 to-emerald-500"
                            : analysisResult.atsScore >= 60
                            ? "bg-linear-to-r from-blue-500 to-cyan-500"
                            : "bg-linear-to-r from-orange-500 to-red-500"
                        }`}
                        style={{ width: `${analysisResult.atsScore}%` }}
                      ></div>
                    </div>
                    <p
                      className={`text-sm md:text-base font-medium ${
                        analysisResult.atsScore >= 80
                          ? "text-green-700"
                          : analysisResult.atsScore >= 60
                          ? "text-blue-700"
                          : "text-orange-700"
                      }`}
                    >
                      {analysisResult.atsScore >= 80
                        ? "🎉 Excellent! Your resume is well-optimized for ATS systems."
                        : analysisResult.atsScore >= 60
                        ? "👍 Good foundation, but there's room for improvement."
                        : "⚠️ Needs optimization to pass ATS filters effectively."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Strengths Card */}
                {analysisResult.strengths &&
                  analysisResult.strengths.length > 0 && (
                    <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 md:p-8 border border-green-200 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                          <span className="text-xl">✅</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                          Strengths
                        </h3>
                      </div>
                      <ul className="space-y-3 md:space-y-4">
                        {analysisResult.strengths.map((strength, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white/60 hover:bg-white/80 transition-colors"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <span className="text-green-500 mt-1 shrink-0 font-bold text-lg">
                              ✓
                            </span>
                            <span className="flex-1 text-sm md:text-base text-gray-700 leading-relaxed">
                              {strength}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Weaknesses Card */}
                {analysisResult.weaknesses &&
                  analysisResult.weaknesses.length > 0 && (
                    <div className="bg-linear-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg p-6 md:p-8 border border-orange-200 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                          <span className="text-xl">⚠️</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                          Weaknesses
                        </h3>
                      </div>
                      <ul className="space-y-3 md:space-y-4">
                        {analysisResult.weaknesses.map((weakness, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white/60 hover:bg-white/80 transition-colors"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <span className="text-orange-500 mt-1 shrink-0 font-bold text-lg">
                              ⚠
                            </span>
                            <span className="flex-1 text-sm md:text-base text-gray-700 leading-relaxed">
                              {weakness}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              {/* Suggestions Card */}
              {analysisResult.suggestions &&
                analysisResult.suggestions.length > 0 && (
                  <div className="bg-linear-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-6 md:p-8 border border-purple-200 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                        <span className="text-xl">💡</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                        Suggestions for Improvement
                      </h3>
                    </div>
                    <ul className="space-y-3 md:space-y-4">
                      {analysisResult.suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 p-4 rounded-lg bg-white/60 hover:bg-white/80 transition-colors border-l-4 border-purple-400"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <span className="text-purple-500 mt-1 shrink-0 font-bold text-lg">
                            💡
                          </span>
                          <span className="flex-1 text-sm md:text-base text-gray-700 leading-relaxed">
                            {suggestion}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyser;

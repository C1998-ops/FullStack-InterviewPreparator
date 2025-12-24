import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
const client = new OAuth2Client({ client_id: process.env.GOOGLE_CLIENT_ID });

export async function googlePKCEAuth(req, res) {
  try {
    const { code_verifier, code, redirect_uri } = req.body;

    if (!code_verifier || !code || !redirect_uri) {
      return res
        .status(400)
        .json({ error: "Missing code_verifier or code or redirect_uri" });
    }
    // Exchange authorization code for tokens with Google
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirect_uri,
        code_verifier: code_verifier,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { id_token } = tokenRes.data;

    if (!id_token) {
      return res
        .status(400)
        .json({ error: "No id_token received from Google" });
    }

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    // Generate JWT token (expires in 5 minutes for testing)
    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: '2h', // 2 hours in seconds
    });

    // Decode token to get expiration time
    const decoded = jwt.decode(token);
    const expiresAt = decoded?.exp ? decoded.exp * 1000 : null; // Convert to milliseconds

    res.json({
      token,
      user,
      expiresAt, // Send expiration timestamp in milliseconds
      expiresIn: 2 * 60 * 60 * 1000, // Send expiration duration in milliseconds (2 hours)
    });
  } catch (error) {
    console.error("PKCE Auth Error:", error);
    if (error.response) {
      return res.status(error.response.status).json({
        error:
          error.response.data?.error_description ||
          error.response.data?.error ||
          "Authentication failed",
      });
    }
    return res
      .status(500)
      .json({ error: "Internal server error during authentication" });
  }
}

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("No authorization header found");
      return res.status(401).json({ message: "Unauthorized: No authorization header" });
    }
    
    // Check if it's a Bearer token
    if (!authHeader.startsWith("Bearer ")) {
      console.log("Authorization header doesn't start with 'Bearer '");
      return res.status(401).json({ message: "Unauthorized: Invalid token format" });
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("No token found after 'Bearer '");
      return res.status(401).json({ message: "Unauthorized: Token not found" });
    }
    
    // Verify JWT token
    const jwtDecoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = jwtDecoded;
    next();
  } catch (error) {
    console.error("Authentication Error:", error.name, error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      if (error.message.includes("malformed")) {
        return res.status(401).json({ message: "Malformed token: Token format is invalid" });
      }
      return res.status(401).json({ message: `Invalid token: ${error.message}` });
    } else {
      return res.status(401).json({ message: `Unauthorized: ${error.message}` });
    }
  }
};
export default authMiddleware;

import jwt from "jsonwebtoken";

export function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ message: "Authentication required." });
  try {
    const admin = jwt.verify(
      token,
      process.env.JWT_SECRET || "development-secret",
    );
    if (admin.otp !== true) {
      return res.status(401).json({
        message: "Please sign in again using email verification.",
      });
    }
    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}
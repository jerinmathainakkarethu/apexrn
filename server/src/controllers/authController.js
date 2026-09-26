import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { databaseConfigured } from "../db.js";
import { findAdminByEmail } from "../models/admin.js";

export async function login(req, res, next) {
  try {
    let admin;
    if (databaseConfigured) {
      admin = await findAdminByEmail(req.body.email);
    } else if (
      req.body.email ===
      (process.env.SEED_ADMIN_EMAIL || "admin@apexrnprep.com")
    ) {
      admin = {
        id: 1,
        email: req.body.email,
        role: "admin",
        password_hash: await bcrypt.hash(
          process.env.SEED_ADMIN_PASSWORD || "change-me",
          10,
        ),
      };
    }
    if (
      !admin ||
      !(await bcrypt.compare(req.body.password, admin.password_hash))
    )
      return res.status(401).json({ message: "Invalid email or password." });
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || "development-secret",
      { expiresIn: "8h" },
    );
    res.json({
      token,
      admin: { id: admin.id, email: admin.email, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
}
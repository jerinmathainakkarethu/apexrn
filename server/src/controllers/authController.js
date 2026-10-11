import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { databaseConfigured } from "../db.js";
import {
  findAdminByEmail,
  findAdminByEmailExcludingId,
  findAdminById,
  updateAdminProfile,
} from "../models/admin.js";

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

export async function updateProfile(req, res, next) {
  try {
    if (!databaseConfigured) {
      return res.status(503).json({
        message: "Admin profile updates require a configured MySQL database.",
      });
    }

    const admin = await findAdminById(req.admin.id);
    if (!admin)
      return res.status(404).json({ message: "Admin account was not found." });

    const { email, currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!(await bcrypt.compare(currentPassword, admin.password_hash))) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    if (newPassword || confirmNewPassword) {
      if (!newPassword || !confirmNewPassword) {
        return res.status(422).json({
          message: "Enter and confirm the new password.",
        });
      }
      if (newPassword !== confirmNewPassword) {
        return res.status(422).json({
          message: "The new passwords do not match.",
        });
      }
      if (newPassword.length < 8) {
        return res.status(422).json({
          message: "The new password must be at least 8 characters.",
        });
      }
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (
      normalizedEmail !== admin.email.toLowerCase() &&
      (await findAdminByEmailExcludingId(normalizedEmail, admin.id))
    ) {
      return res.status(409).json({
        message: "An admin account already uses that email address.",
      });
    }

    const passwordHash = newPassword
      ? await bcrypt.hash(newPassword, 12)
      : undefined;
    const updatedAdmin = await updateAdminProfile(admin.id, {
      email: normalizedEmail,
      passwordHash,
    });
    const token = jwt.sign(
      { id: updatedAdmin.id, email: updatedAdmin.email, role: updatedAdmin.role },
      process.env.JWT_SECRET || "development-secret",
      { expiresIn: "8h" },
    );

    res.json({
      token,
      admin: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "An admin account already uses that email address.",
      });
    }
    next(error);
  }
}
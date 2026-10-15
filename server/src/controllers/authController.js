import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { databaseConfigured } from "../db.js";
import {
  findAdminByEmail,
  findAdminByEmailExcludingId,
  findAdminById,
  updateAdminProfile,
} from "../models/admin.js";

const OTP_LIFETIME_MS = 10 * 60 * 1000;
const OTP_RESEND_DELAY_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const otpChallenges = new Map();
const otpLastSent = new Map();

function digestOtp(code) {
  return createHash("sha256").update(code).digest();
}

function maskEmail(email) {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}${"*".repeat(Math.max(3, name.length - 1))}@${domain}`;
}

export async function requestLoginOtp(req, res, next) {
  try {
    const email = req.body.email.trim().toLowerCase();
    let admin;
    if (databaseConfigured) {
      admin = await findAdminByEmail(email);
    } else if (
      email === (process.env.SEED_ADMIN_EMAIL || "admin@apexrnprep.com")
    ) {
      admin = {
        id: 1,
        email,
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

    const now = Date.now();
    const lastSent = otpLastSent.get(String(admin.id)) || 0;
    if (now - lastSent < OTP_RESEND_DELAY_MS) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another code.",
      });
    }

    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS;
    if (!smtpUser || !smtpPass) {
      return res.status(503).json({
        message: "Email delivery is not configured on the server.",
      });
    }

    const destination = admin.email;
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to: destination,
      subject: "Your APEX RN Prep admin verification code",
      text: `Your admin sign-in code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
      html: `<p>Your APEX RN Prep admin sign-in code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`,
    });
    otpChallenges.set(String(admin.id), {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      codeHash: digestOtp(code),
      expiresAt: now + OTP_LIFETIME_MS,
      attempts: 0,
    });
    otpLastSent.set(String(admin.id), now);

    res.json({
      message: "A verification code has been sent to your admin email.",
      destination: maskEmail(destination),
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyLoginOtp(req, res, next) {
  try {
    const email = req.body.email.trim().toLowerCase();
    let admin;
    if (databaseConfigured) {
      admin = await findAdminByEmail(email);
    } else if (
      email === (process.env.SEED_ADMIN_EMAIL || "admin@apexrnprep.com")
    ) {
      admin = {
        id: 1,
        email,
        role: "admin",
      };
    }

    const challenge = admin && otpChallenges.get(String(admin.id));
    if (
      !challenge ||
      challenge.email.toLowerCase() !== email ||
      challenge.expiresAt <= Date.now()
    ) {
      if (admin) otpChallenges.delete(String(admin.id));
      return res.status(401).json({
        message: "That verification code is invalid or expired. Sign in again to request another.",
      });
    }

    challenge.attempts += 1;
    const suppliedHash = digestOtp(req.body.code);
    const codeMatches = timingSafeEqual(challenge.codeHash, suppliedHash);
    if (!codeMatches) {
      if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
        otpChallenges.delete(String(admin.id));
        return res.status(401).json({
          message: "Too many incorrect codes. Sign in again to request a new code.",
        });
      }
      return res.status(401).json({
        message: "The verification code is incorrect.",
      });
    }

    otpChallenges.delete(String(admin.id));
    otpLastSent.delete(String(admin.id));
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, otp: true },
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
      {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        otp: true,
      },
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
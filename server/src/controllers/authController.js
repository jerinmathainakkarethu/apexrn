import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { databaseConfigured } from "../db.js";
import { createSmtpTransport } from "../utils/smtp.js";
import {
  findAdminByEmail,
  findAdminByEmailExcludingId,
  findAdminById,
  findOtpChallenge,
  updateAdminPassword,
  updateAdminProfile,
  deleteOtpChallenge,
  incrementOtpAttempts,
  saveOtpChallenge,
} from "../models/admin.js";

const OTP_LIFETIME_MS = 10 * 60 * 1000;
const OTP_RESEND_DELAY_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function digestOtp(code) {
  return createHash("sha256").update(code).digest();
}

function maskEmail(email) {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}${"*".repeat(Math.max(3, name.length - 1))}@${domain}`;
}

async function deliverOtp(destination, purpose) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const { smtp, transporter } = await createSmtpTransport();
  const action =
    purpose === "login"
      ? "admin sign-in"
      : purpose === "password-reset"
        ? "admin password reset"
        : "password change";
  await transporter.sendMail({
    from: smtp.from || smtp.user,
    to: destination,
    subject: `Your APEX RN Prep ${action} verification code`,
    text: `Your ${action} verification code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`,
    html: `<p>Your APEX RN Prep ${action} verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`,
  });
  return code;
}

export async function requestPasswordResetOtp(req, res, next) {
  try {
    if (!databaseConfigured) {
      return res.status(503).json({
        message: "Password recovery is temporarily unavailable.",
      });
    }

    const email = req.body.email.trim().toLowerCase();
    const admin = await findAdminByEmail(email);
    if (admin) {
      const now = Date.now();
      const existingChallenge = await findOtpChallenge(
        admin.id,
        "password-reset",
      );
      if (
        !existingChallenge ||
        now - Number(existingChallenge.created_at_ms) >= OTP_RESEND_DELAY_MS
      ) {
        const code = await deliverOtp(admin.email, "password-reset");
        await saveOtpChallenge({
          adminId: admin.id,
          email: admin.email,
          purpose: "password-reset",
          codeHash: digestOtp(code).toString("hex"),
          expiresAt: now + OTP_LIFETIME_MS,
          createdAt: now,
        });
      }
    }

    return res.json({
      message:
        "If that email belongs to an admin account, a password reset code has been sent.",
    });
  } catch (error) {
    if (error.status === 503)
      return res.status(503).json({ message: error.message });
    return next(error);
  }
}

export async function resetPasswordWithOtp(req, res, next) {
  try {
    if (!databaseConfigured) {
      return res.status(503).json({
        message: "Password recovery is temporarily unavailable.",
      });
    }
    if (req.body.newPassword !== req.body.confirmNewPassword) {
      return res.status(422).json({ message: "The new passwords do not match." });
    }

    const email = req.body.email.trim().toLowerCase();
    const admin = await findAdminByEmail(email);
    const challenge = admin && (await findOtpChallenge(admin.id, "password-reset"));
    if (
      !admin ||
      !challenge ||
      challenge.email.toLowerCase() !== email ||
      Number(challenge.expires_at_ms) <= Date.now()
    ) {
      if (admin) await deleteOtpChallenge(admin.id, "password-reset");
      return res.status(401).json({
        message: "That verification code is invalid or expired. Request a new code.",
      });
    }

    const updatedChallenge = await incrementOtpAttempts(
      admin.id,
      "password-reset",
    );
    const codeMatches = timingSafeEqual(
      Buffer.from(challenge.code_hash, "hex"),
      digestOtp(req.body.code),
    );
    if (!codeMatches) {
      if (Number(updatedChallenge.attempts) >= OTP_MAX_ATTEMPTS) {
        await deleteOtpChallenge(admin.id, "password-reset");
        return res.status(401).json({
          message: "Too many incorrect codes. Request a new code.",
        });
      }
      return res.status(401).json({
        message: "The verification code is incorrect.",
      });
    }

    const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await updateAdminPassword(admin.id, passwordHash);
    await deleteOtpChallenge(admin.id, "password-reset");
    return res.json({
      message: "Your password has been reset. You can now sign in.",
    });
  } catch (error) {
    return next(error);
  }
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
    const existingChallenge = await findOtpChallenge(admin.id, "login");
    if (
      existingChallenge &&
      now - Number(existingChallenge.created_at_ms) < OTP_RESEND_DELAY_MS
    ) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another code.",
      });
    }

    const destination = admin.email;
    const code = await deliverOtp(destination, "login");
    await saveOtpChallenge({
      adminId: admin.id,
      email: admin.email,
      purpose: "login",
      codeHash: digestOtp(code).toString("hex"),
      expiresAt: now + OTP_LIFETIME_MS,
      createdAt: now,
    });

    res.json({
      message: "A verification code has been sent to your admin email.",
      destination: maskEmail(destination),
    });
  } catch (error) {
    next(error);
  }
}

export async function requestPasswordChangeOtp(req, res, next) {
  try {
    if (!databaseConfigured) {
      return res.status(503).json({
        message: "Password changes require a configured MySQL database.",
      });
    }

    const admin = await findAdminById(req.admin.id);
    if (!admin)
      return res.status(404).json({ message: "Admin account was not found." });

    const now = Date.now();
    const existingChallenge = await findOtpChallenge(
      admin.id,
      "password-change",
    );
    if (
      existingChallenge &&
      now - Number(existingChallenge.created_at_ms) < OTP_RESEND_DELAY_MS
    ) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another code.",
      });
    }

    const code = await deliverOtp(admin.email, "password-change");
    await saveOtpChallenge({
      adminId: admin.id,
      email: admin.email,
      purpose: "password-change",
      codeHash: digestOtp(code).toString("hex"),
      expiresAt: now + OTP_LIFETIME_MS,
      createdAt: now,
    });

    res.json({
      message: "A password change verification code has been sent.",
      destination: maskEmail(admin.email),
    });
  } catch (error) {
    if (error.status === 503)
      return res.status(503).json({ message: error.message });
    next(error);
  }
}

export async function verifyPasswordChangeOtp(req, res, next) {
  try {
    if (!databaseConfigured) {
      return res.status(503).json({
        message: "Password changes require a configured MySQL database.",
      });
    }

    const admin = await findAdminById(req.admin.id);
    if (!admin)
      return res.status(404).json({ message: "Admin account was not found." });

    const challenge = await findOtpChallenge(admin.id, "password-change");
    if (
      !challenge ||
      challenge.email.toLowerCase() !== admin.email.toLowerCase() ||
      Number(challenge.expires_at_ms) <= Date.now()
    ) {
      await deleteOtpChallenge(admin.id, "password-change");
      return res.status(401).json({
        message: "That verification code is invalid or expired. Request a new code.",
      });
    }

    const updatedChallenge = await incrementOtpAttempts(
      admin.id,
      "password-change",
    );
    const codeMatches = timingSafeEqual(
      Buffer.from(challenge.code_hash, "hex"),
      digestOtp(req.body.code),
    );
    if (!codeMatches) {
      if (Number(updatedChallenge.attempts) >= OTP_MAX_ATTEMPTS) {
        await deleteOtpChallenge(admin.id, "password-change");
        return res.status(401).json({
          message: "Too many incorrect codes. Request a new code.",
        });
      }
      return res.status(401).json({
        message: "The verification code is incorrect.",
      });
    }

    const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    await updateAdminPassword(admin.id, passwordHash);
    await deleteOtpChallenge(admin.id, "password-change");
    res.json({ message: "Your password has been updated successfully." });
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

    const challenge = admin && (await findOtpChallenge(admin.id, "login"));
    if (
      !challenge ||
      challenge.email.toLowerCase() !== email ||
      Number(challenge.expires_at_ms) <= Date.now()
    ) {
      if (admin) await deleteOtpChallenge(admin.id, "login");
      return res.status(401).json({
        message: "That verification code is invalid or expired. Sign in again to request another.",
      });
    }

    const updatedChallenge = await incrementOtpAttempts(admin.id, "login");
    const suppliedHash = digestOtp(req.body.code);
    const codeMatches = timingSafeEqual(
      Buffer.from(challenge.code_hash, "hex"),
      suppliedHash,
    );
    if (!codeMatches) {
      if (Number(updatedChallenge.attempts) >= OTP_MAX_ATTEMPTS) {
        await deleteOtpChallenge(admin.id, "login");
        return res.status(401).json({
          message: "Too many incorrect codes. Sign in again to request a new code.",
        });
      }
      return res.status(401).json({
        message: "The verification code is incorrect.",
      });
    }

    await deleteOtpChallenge(admin.id, "login");
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

    const { email, currentPassword } = req.body;
    if (!(await bcrypt.compare(currentPassword, admin.password_hash))) {
      return res.status(401).json({ message: "Current password is incorrect." });
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

    const updatedAdmin = await updateAdminProfile(admin.id, {
      email: normalizedEmail,
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
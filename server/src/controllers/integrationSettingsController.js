import { databaseConfigured } from "../db.js";
import {
  getIntegrationSettings,
  saveIntegrationSettings,
} from "../models/integrationSettings.js";
import { findAdminById } from "../models/admin.js";
import { createSmtpTransport } from "../utils/smtp.js";

function publicSettings(settings) {
  return {
    smtp: {
      host: settings.smtp.host,
      port: settings.smtp.port,
      secure: settings.smtp.secure,
      user: settings.smtp.user,
      from: settings.smtp.from,
      passwordConfigured: Boolean(settings.smtp.password),
    },
  };
}

export async function getSettings(req, res, next) {
  try {
    res.json(publicSettings(await getIntegrationSettings()));
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    if (!databaseConfigured) {
      return res.status(503).json({
        message: "Settings require a configured MySQL database.",
      });
    }

    const current = await getIntegrationSettings();
    const { smtp = {} } = req.body;

    const next = {
      smtp: {
        host: String(smtp.host || "").trim(),
        port: Number(smtp.port),
        secure: smtp.secure === true || smtp.secure === "true",
        user: String(smtp.user || "").trim(),
        password: req.body.clearSmtpPassword
          ? ""
          : String(smtp.password || "").trim() || current.smtp.password,
        from: String(smtp.from || "").trim(),
      },
    };

    const smtpIsBeingConfigured = Boolean(
      smtp.user ||
        smtp.from ||
        smtp.password ||
        current.smtp.user ||
        current.smtp.from ||
        current.smtp.password,
    );
    if (
      smtpIsBeingConfigured &&
      (!next.smtp.host ||
        !Number.isInteger(next.smtp.port) ||
        next.smtp.port < 1 ||
        next.smtp.port > 65535 ||
        !next.smtp.user ||
        !next.smtp.from ||
        (!next.smtp.password && !req.body.clearSmtpPassword))
    ) {
      return res.status(422).json({
        message:
          "Enter a valid SMTP host, port, username, sender address, and password.",
      });
    }
    if (next.smtp.user.length > 190 || next.smtp.from.length > 190) {
      return res.status(422).json({
        message: "SMTP email addresses must be 190 characters or fewer.",
      });
    }
    await saveIntegrationSettings(next);
    return res.json(publicSettings(next));
  } catch (error) {
    return next(error);
  }
}

export async function sendTestEmail(req, res, next) {
  try {
    const admin = await findAdminById(req.admin.id);
    if (!admin?.email) {
      return res.status(404).json({ message: "Admin email was not found." });
    }
    const { smtp, transporter } = await createSmtpTransport();
    await transporter.sendMail({
      from: smtp.from || smtp.user,
      to: admin.email,
      subject: "APEX RN Prep SMTP test",
      text: "SMTP is configured and sending email successfully.",
    });
    return res.json({ message: `Test email sent to ${admin.email}.` });
  } catch (error) {
    console.error("SMTP test email failed:", error);
    return res.status(error.status || 502).json({
      message:
        error.status === 503
          ? error.message
          : "SMTP test failed. Check the host, port, TLS option, username, and app password.",
    });
  }
}

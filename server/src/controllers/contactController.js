import nodemailer from "nodemailer";
import { databaseConfigured } from "../db.js";
import { insertContact } from "../models/contact.js";
import { listAdminEmails } from "../models/admin.js";

export async function submit(req, res, next) {
  try {
    if (!databaseConfigured) {
      return res.status(503).json({
        message: "Contact submissions are temporarily unavailable.",
      });
    }

    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS;
    if (!smtpUser || !smtpPass) {
      return res.status(503).json({
        message: "Contact submissions are temporarily unavailable.",
      });
    }

    const recipients = await listAdminEmails();
    if (recipients.length === 0) {
      return res.status(503).json({
        message: "Contact submissions are temporarily unavailable.",
      });
    }

    await insertContact(req.body);

    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: smtpPort,
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === "true"
        : smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || smtpUser,
        to: recipients,
        replyTo: req.body.email,
        subject: "New APEX RN Prep contact message",
        text: [
          "A new message was submitted through the APEX RN Prep contact form.",
          "",
          `Name: ${req.body.name}`,
          `Email: ${req.body.email}`,
          `WhatsApp: ${req.body.whatsapp || "Not provided"}`,
          "",
          "Message:",
          req.body.message,
        ].join("\n"),
      });
    } catch (error) {
      console.error(
        "Contact submission was saved, but admin email delivery failed:",
        error,
      );
      return res.status(502).json({
        message:
          "Your message was saved, but the team could not be notified by email. Please contact us directly instead of sending it again.",
      });
    }

    return res
      .status(201)
      .json({ message: "Thanks, your message has been received." });
  } catch (error) {
    next(error);
  }
}
import nodemailer from "nodemailer";
import { getSmtpSettings } from "../models/integrationSettings.js";

export async function createSmtpTransport() {
  const smtp = await getSmtpSettings();
  if (!smtp.user || !smtp.password) {
    const error = new Error("Email delivery is not configured on the server.");
    error.status = 503;
    throw error;
  }

  return {
    smtp,
    transporter: nodemailer.createTransport({
      host: smtp.host,
      port: Number(smtp.port),
      secure: Boolean(smtp.secure),
      auth: { user: smtp.user, pass: smtp.password },
    }),
  };
}

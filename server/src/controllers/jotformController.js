import { databaseConfigured } from "../db.js";
import { insertJotformRegistration, findJotformBySubmissionId } from "../models/jotformRegistration.js";
import fallback from "../utils/fallback.js";
import { nextId } from "../utils/helpers.js";
import { mapJotformPayload, extractSubmissionId, getJotformConfig } from "../utils/jotform.js";

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    null
  );
}

export async function handleWebhook(req, res, next) {
  try {
    const config = getJotformConfig();
    const submissionId = extractSubmissionId(req.body);
    if (submissionId) {
      const existing = databaseConfigured ? await findJotformBySubmissionId(submissionId) : null;
      if (existing) {
        return res.status(200).json({ message: "Submission already recorded.", duplicate: true });
      }
    }
    const mapped = mapJotformPayload(req.body);
    const record = {
      jotform_submission_id: submissionId,
      form_id: mapped.form_id || config.formId || null,
      full_name: mapped.full_name || null,
      email: mapped.email || null,
      phone: mapped.phone || null,
      whatsapp: mapped.whatsapp || null,
      course: mapped.course || null,
      payment_option: mapped.payment_option || null,
      amount: mapped.amount !== undefined && mapped.amount !== null ? mapped.amount : null,
      currency: mapped.currency || null,
      status: "received",
      source: "webhook",
      raw_payload: req.body,
      ip_address: getClientIp(req),
      user_agent: req.headers["user-agent"] || null,
    };
    if (databaseConfigured) {
      await insertJotformRegistration(record);
    } else {
      fallback.jotformRegistrations = fallback.jotformRegistrations || [];
      fallback.jotformRegistrations.push({
        id: nextId(fallback.jotformRegistrations),
        ...record,
        created_at: new Date().toISOString(),
      });
    }
    return res.status(201).json({ message: "Registration received." });
  } catch (error) {
    console.error("Jotform webhook error:", error);
    return next(error);
  }
}

export async function manualIngest(req, res, next) {
  try {
    const config = getJotformConfig();
    const body = req.body || {};
    const submissionId = body.submission_id || body.submissionId || body.id || null;
    if (submissionId) {
      const existing = databaseConfigured ? await findJotformBySubmissionId(submissionId) : null;
      if (existing) {
        return res.status(200).json({ message: "Submission already recorded.", duplicate: true });
      }
    }
    const mapped = mapJotformPayload(body.payload || body.answers || body);
    const record = {
      jotform_submission_id: submissionId,
      form_id: mapped.form_id || body.form_id || config.formId || null,
      full_name: mapped.full_name || body.full_name || null,
      email: mapped.email || body.email || null,
      phone: mapped.phone || body.phone || null,
      whatsapp: mapped.whatsapp || body.whatsapp || null,
      course: mapped.course || body.course || null,
      payment_option: mapped.payment_option || body.payment_option || null,
      amount: mapped.amount !== undefined && mapped.amount !== null ? mapped.amount : body.amount || null,
      currency: mapped.currency || body.currency || null,
      status: "received",
      source: "api",
      raw_payload: body,
      ip_address: getClientIp(req),
      user_agent: req.headers["user-agent"] || null,
    };
    if (databaseConfigured) {
      await insertJotformRegistration(record);
    } else {
      fallback.jotformRegistrations = fallback.jotformRegistrations || [];
      fallback.jotformRegistrations.push({
        id: nextId(fallback.jotformRegistrations),
        ...record,
        created_at: new Date().toISOString(),
      });
    }
    return res.status(201).json({ message: "Registration ingested." });
  } catch (error) {
    console.error("Jotform manual ingest error:", error);
    return next(error);
  }
}

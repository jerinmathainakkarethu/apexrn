const DEFAULT_CONFIG = {
  jotformUrl: process.env.JOTFORM_URL || "",
  formId: process.env.JOTFORM_FORM_ID || "",
  apiKey: process.env.JOTFORM_API_KEY || "",
  webhookSecret: process.env.JOTFORM_WEBHOOK_SECRET || "",
};

const DEFAULT_FIELD_MAP = {
  full_name: ["fullName", "full_name", "name", "q1_fullName", "student_name"],
  email: ["email", "eMail", "q2_email"],
  phone: ["phone", "phoneNumber", "q3_phone"],
  whatsapp: ["whatsapp", "whatsappNumber", "q4_whatsapp"],
  course: ["course", "program", "q5_course"],
  payment_option: ["paymentOption", "payment_option", "plan", "q6_payment"],
  amount: ["amount", "price", "fee", "q7_amount"],
  currency: ["currency", "q8_currency"],
};

export function getJotformConfig() {
  return {
    jotformUrl: process.env.JOTFORM_URL || DEFAULT_CONFIG.jotformUrl,
    formId: process.env.JOTFORM_FORM_ID || DEFAULT_CONFIG.formId,
    apiKey: process.env.JOTFORM_API_KEY || DEFAULT_CONFIG.apiKey,
    webhookSecret: process.env.JOTFORM_WEBHOOK_SECRET || DEFAULT_CONFIG.webhookSecret,
    fieldMap: DEFAULT_FIELD_MAP,
  };
}

function normalizeKey(key) {
  if (!key) return "";
  return String(key).replace(/\s+/g, "").toLowerCase();
}

function findValue(obj, candidates) {
  if (!obj || typeof obj !== "object") return undefined;
  // try direct keys
  for (const c of candidates) {
    if (obj[c] !== undefined && obj[c] !== null && obj[c] !== "") return obj[c];
  }
  // try normalized
  const entries = Object.entries(obj);
  for (const [k, v] of entries) {
    const nk = normalizeKey(k);
    for (const c of candidates) {
      if (nk.includes(normalizeKey(c))) {
        if (v !== undefined && v !== null && v !== "") return v;
      }
    }
  }
  // try nested answers
  if (obj.answers && typeof obj.answers === "object") {
    for (const [, val] of Object.entries(obj.answers)) {
      if (val && typeof val === "object") {
        const res = findValue(val, candidates);
        if (res !== undefined && res !== null && res !== "") return res;
      }
    }
  }
  if (obj.questions && typeof obj.questions === "object") {
    for (const [, val] of Object.entries(obj.questions)) {
      if (val && typeof val === "object") {
        const res = findValue(val, candidates);
        if (res !== undefined && res !== null && res !== "") return res;
      }
    }
  }
  return undefined;
}

export function mapJotformPayload(payload) {
  const config = getJotformConfig();
  const map = config.fieldMap;
  const result = { form_id: config.formId };
  for (const [target, candidates] of Object.entries(map)) {
    const val = findValue(payload, candidates);
    if (val !== undefined) result[target] = val;
  }
  // also try common locations
  if (payload?.formID) result.form_id = payload.formID;
  if (payload?.form_id) result.form_id = payload.form_id;
  return result;
}

export function extractSubmissionId(payload) {
  if (!payload) return null;
  return (
    payload.submissionID ||
    payload.submission_id ||
    payload.id ||
    payload?.rawRequest?.submissionID ||
    payload?.submission?.id ||
    null
  );
}

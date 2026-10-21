const DEFAULT_JOTFORM_URL = "https://form.jotform.com/240058982412052";
const DEFAULT_JOTFORM_FORM_ID = "240058982412052";

export const jotformConfig = {
  url: import.meta.env.VITE_JOTFORM_URL || DEFAULT_JOTFORM_URL,
  formId: import.meta.env.VITE_JOTFORM_FORM_ID || DEFAULT_JOTFORM_FORM_ID,
};

export default jotformConfig;

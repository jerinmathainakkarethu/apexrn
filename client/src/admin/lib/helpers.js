import { useMemo } from "react";

/**
 * Any data hook can report an expired session without prop-drilling a
 * logout callback: the shell subscribes once, the hooks just call this.
 */
const sessionListeners = new Set();

export function onSessionExpired(listener) {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
}

export function sessionExpired() {
  sessionListeners.forEach((listener) => listener());
}

/** Shared helpers for every admin editor. */
export function parseContent(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
export function apiError(error, fallback = "The change could not be saved.") {
  const details = error.response?.data?.errors;
  if (Array.isArray(details) && details.length)
    return details.map((item) => `${item.field}: ${item.message}`).join(" ");
  return error.response?.data?.message || fallback;
}
export function validateFields(value, fields) {
  return fields.reduce((errors, [key, label, optional]) => {
    if (optional) return errors;
    if (!String(value[key] ?? "").trim()) errors[key] = `${label} is required.`;
    return errors;
  }, {});
}

export function setHomePath(value, path, nextValue) {
  const next = structuredClone(value);
  let target = next;
  path.slice(0, -1).forEach((key) => {
    target[key] = target[key] ?? {};
    target = target[key];
  });
  target[path[path.length - 1]] = nextValue;
  return next;
}

export function linesToArray(text) {
  return String(text)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function useContentDocument(value, onChange) {
  const content = useMemo(() => parseContent(value) || {}, [value]);
  const update = (path, nextValue) =>
    onChange(JSON.stringify(setHomePath(content, path, nextValue), null, 2));
  const updateItem = (path, index, field, nextValue) =>
    update([...path, index, field], nextValue);
  const updateList = (path, text) => update(path, linesToArray(text));
  const updateImage = (urlPath, altPath, image) => {
    let next = setHomePath(content, urlPath, image.url);
    next = setHomePath(next, altPath, image.alt);
    onChange(JSON.stringify(next, null, 2));
  };
  return { content, update, updateItem, updateList, updateImage };
}

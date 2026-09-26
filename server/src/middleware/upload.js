import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
export const uploadDirectoryPath = path.resolve(
  serverDirectory,
  "../..",
  process.env.UPLOAD_DIR || "uploads",
);
fs.mkdirSync(uploadDirectoryPath, { recursive: true });

export const imageUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectoryPath,
    filename: (_, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(
        null,
        `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`,
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, callback) =>
    callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});
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

const storage = multer.diskStorage({
  destination: uploadDirectoryPath,
  filename: (_, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(
      null,
      `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`,
    );
  },
});

export const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, callback) =>
    callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});

export const videoUpload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_VIDEO_SIZE || 200) * 1024 * 1024 },
  fileFilter: (_, file, callback) =>
    callback(
      null,
      /^video\/(mp4|webm|quicktime|x-matroska|ogg|x-msvideo)$/.test(
        file.mimetype,
      ),
    ),
});

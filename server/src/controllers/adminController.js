import { databaseConfigured } from "../db.js";
import { listContacts as fetchContacts } from "../models/contact.js";
import { listRegistrations } from "../models/qaRegistration.js";
import { imageUpload, videoUpload } from "../middleware/upload.js";
import fallback from "../utils/fallback.js";

export async function listContacts(req, res, next) {
  try {
    res.json(databaseConfigured ? await fetchContacts() : fallback.contacts);
  } catch (error) {
    next(error);
  }
}

export async function listQa(req, res, next) {
  try {
    res.json(
      databaseConfigured ? await listRegistrations() : fallback.registrations,
    );
  } catch (error) {
    next(error);
  }
}

export function upload(req, res, next) {
  imageUpload.single("image")(req, res, (error) => {
    if (error)
      return res
        .status(422)
        .json({
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "Images must be smaller than 5 MB."
              : "Only JPG, PNG, WEBP, and GIF images are supported.",
        });
    if (!req.file)
      return res.status(422).json({ message: "Choose an image to upload." });
    res
      .status(201)
      .json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
  });
}

export function uploadVideo(req, res, next) {
  videoUpload.single("video")(req, res, (error) => {
    if (error)
      return res
        .status(422)
        .json({
          message:
            error.code === "LIMIT_FILE_SIZE"
              ? "Videos must be smaller than 200 MB."
              : "Only MP4, WEBM, MOV, MKV, and OGG videos are supported.",
        });
    if (!req.file)
      return res.status(422).json({ message: "Choose a video to upload." });
    res
      .status(201)
      .json({ url: `/uploads/${req.file.filename}`, filename: req.file.filename });
  });
}
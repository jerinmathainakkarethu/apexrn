import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { databaseConfigured, verifyDatabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import homeRoutes from "./routes/home.js";
import aboutRoutes from "./routes/about.js";
import menuRoutes from "./routes/menu.js";
import programRoutes from "./routes/program.js";
import programDetailsRoutes from "./routes/programDetails.js";
import testimonialRoutes from "./routes/testimonials.js";
import faqRoutes from "./routes/faqs.js";
import resourceRoutes from "./routes/resources.js";
import contactRoutes from "./routes/contact.js";
import qaRoutes from "./routes/qa.js";
import adminRoutes from "./routes/admin.js";
import { uploadDirectoryPath } from "./middleware/upload.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === clientUrl ||
        /^https?:\/\/localhost:\d+$/.test(origin)
      )
        return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }));
app.use("/uploads", express.static(uploadDirectoryPath));

app.get("/api/health", async (_, res) => {
  if (!databaseConfigured)
    return res.json({ status: "ok", database: "not-configured" });
  try {
    await verifyDatabase();
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "unavailable",
      message: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/program", programRoutes);
app.use("/api/program-details", programDetailsRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/qa", qaRoutes);
app.use("/api/admin", adminRoutes);

app.use((_, res) => res.status(404).json({ message: "Route not found." }));
app.use(errorHandler);

async function start() {
  if (databaseConfigured) {
    await verifyDatabase();
    console.log(`Connected to MySQL database ${process.env.DB_NAME}`);
  }
  app.listen(port, () => console.log(`APEX RN Prep API listening on ${port}`));
}
start().catch((error) => {
  console.error("Unable to start API:", error.message);
  process.exit(1);
});
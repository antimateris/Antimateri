import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Import modular serverless handlers
import checkoutHandler from "./api/payment/doku/checkout";
import callbackHandler from "./api/payment/callback";
import statusHandler from "./api/payment/doku/status/[invoiceNumber]";
import simulateSuccessHandler from "./api/payment/doku/simulate-success";
import healthHandler from "./api/health";

const app = express();
const PORT = 3000;

app.use(express.json());

// =================================================================
// API ROUTES (Routed directly to Vercel-compatible Serverless Handlers)
// =================================================================

app.all("/api/payment/doku/checkout", (req, res) => checkoutHandler(req, res));
app.all("/api/payment/callback", (req, res) => callbackHandler(req, res));
app.all("/api/payment/doku/status/:invoiceNumber", (req, res) => {
  req.query = { ...req.query, invoiceNumber: req.params.invoiceNumber };
  return statusHandler(req, res);
});
app.all("/api/payment/doku/simulate-success", (req, res) => simulateSuccessHandler(req, res));
app.all("/api/health", (req, res) => healthHandler(req, res));

// =================================================================
// STATIC ASSET SERVING & VITE MIDDLEWARE
// =================================================================
async function startServer() {
  // Verification on startup
  if (!process.env.DOKU_CLIENT_ID || !process.env.DOKU_SECRET_KEY) {
    console.warn("[WARNING] DOKU_CLIENT_ID atau DOKU_SECRET_KEY belum diset di environment variable. Endpoint /api/payment/doku/checkout akan mengembalikan 500 'DOKU credentials not configured' sampai env var diisi.");
  } else {
    console.log("[INFO] DOKU Payment Gateway credentials detected.");
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

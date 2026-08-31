import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// DOKU Signature Helper
function generateDokuSignature({
  clientId,
  requestId,
  requestTimestamp,
  requestTarget,
  bodyJsonString,
  secretKey
}: {
  clientId: string;
  requestId: string;
  requestTimestamp: string;
  requestTarget: string;
  bodyJsonString: string;
  secretKey: string;
}) {
  // 1. Digest calculation: Base64(SHA256(Body))
  const digest = crypto.createHash("sha256").update(bodyJsonString).digest("base64");

  // 2. Component signature string
  const componentString = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;

  // 3. HMAC-SHA256 with Secret Key
  const hmac = crypto.createHmac("sha256", secretKey).update(componentString).digest("base64");

  return `HMACSHA256=${hmac}`;
}

// API: Create DOKU Checkout Payment URL
app.post("/api/payment/doku/checkout", async (req, res) => {
  try {
    const {
      clientId,
      secretKey,
      isProduction,
      orderNumber,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      productDetails
    } = req.body;

    const activeClientId = clientId || process.env.DOKU_CLIENT_ID || "BRN-0248-1788087931417";
    const activeSecretKey = secretKey || process.env.DOKU_SECRET_KEY || "SK-GBHLCjkOQbzarOKoJLeM";
    const baseUrl = isProduction
      ? "https://api.doku.com"
      : "https://api-sandbox.doku.com";

    const requestTarget = "/checkout/v1/payment";
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z"; // UTC ISO8601

    const payload = {
      order: {
        amount: Math.round(Number(amount)),
        invoice_number: String(orderNumber).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30),
        callback_url: req.headers.referer || "https://ais-dev-qomstwgdhmg6zte5aukc37-744730367656.asia-southeast1.run.app",
        line_items: (productDetails && productDetails.length > 0)
          ? productDetails.map((item: any) => ({
              name: String(item.name || "Topup Game").slice(0, 50),
              price: Math.round(Number(item.price || amount)),
              quantity: Number(item.quantity || 1)
            }))
          : [
              {
                name: "Jasa Topup / Joki BreakoutOps",
                price: Math.round(Number(amount)),
                quantity: 1
              }
            ]
      },
      payment: {
        payment_due_date: 60 // 60 menit
      },
      customer: {
        name: customerName || "Pelanggan BreakoutOps",
        email: customerEmail || "customer@breakoutops.com",
        phone: customerPhone || "081234567890"
      }
    };

    const bodyJsonString = JSON.stringify(payload);
    const signature = generateDokuSignature({
      clientId: activeClientId,
      requestId,
      requestTimestamp,
      requestTarget,
      bodyJsonString,
      secretKey: activeSecretKey
    });

    const dokuResponse = await fetch(`${baseUrl}${requestTarget}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": activeClientId,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        "Signature": signature
      },
      body: bodyJsonString
    });

    const dokuData = await dokuResponse.json();

    if (!dokuResponse.ok) {
      console.error("DOKU API Error:", dokuData);
      return res.status(dokuResponse.status).json({
        success: false,
        message: dokuData.error?.message || "Gagal membuat sesi pembayaran DOKU",
        details: dokuData
      });
    }

    return res.json({
      success: true,
      paymentUrl: dokuData.response?.payment?.url || dokuData.payment?.url,
      expiredDate: dokuData.response?.payment?.expired_date || dokuData.payment?.expired_date,
      data: dokuData
    });
  } catch (error: any) {
    console.error("Internal Server Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Kesalahan internal pada server"
    });
  }
});

// Webhook / Notification Handler from DOKU
app.post("/api/payment/callback", (req, res) => {
  console.log("DOKU Webhook Notification received:", req.body);
  res.status(200).json({ status: "SUCCESS" });
});

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Vite middleware for development & production static serving
async function startServer() {
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

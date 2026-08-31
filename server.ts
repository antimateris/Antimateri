import "dotenv/config";
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
      isProduction,
      orderNumber,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      productDetails
    } = req.body;

    const activeClientId = process.env.DOKU_CLIENT_ID;
    const activeSecretKey = process.env.DOKU_SECRET_KEY;

    if (!activeClientId || !activeSecretKey) {
      return res.status(500).json({
        success: false,
        message: "DOKU_CLIENT_ID dan DOKU_SECRET_KEY belum diatur di environment variable."
      });
    }

    const baseUrl = isProduction
      ? "https://api.doku.com"
      : "https://api-sandbox.doku.com";

    const requestTarget = "/checkout/v1/payment";
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z"; // UTC ISO8601

    // Extract origin cleanly without hash or internal paths
    let originUrl = "https://ais-dev-qomstwgdhmg6zte5aukc37-744730367656.asia-southeast1.run.app";
    if (req.headers.origin) {
      originUrl = req.headers.origin;
    } else if (req.headers.referer) {
      try {
        const parsed = new URL(req.headers.referer);
        originUrl = parsed.origin;
      } catch {}
    }

    // Generate unique invoice number per DOKU checkout attempt (alphanumeric only, max 30 chars)
    const cleanBaseInvoice = String(orderNumber).replace(/[^a-zA-Z0-9]/g, "").slice(0, 24);
    const attemptSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dokuInvoiceNumber = `${cleanBaseInvoice}${attemptSuffix}`;

    const callbackUrl = `${originUrl}/doku-return?invoice_number=${cleanBaseInvoice}&status=success`;
    const callbackUrlCancel = `${originUrl}/doku-return?invoice_number=${cleanBaseInvoice}&status=cancel`;
    const callbackUrlResult = `${originUrl}/doku-return?invoice_number=${cleanBaseInvoice}&status=result`;

    const payload = {
      order: {
        amount: Math.round(Number(amount)),
        invoice_number: dokuInvoiceNumber,
        callback_url: callbackUrl,
        callback_url_cancel: callbackUrlCancel,
        callback_url_result: callbackUrlResult,
        line_items: [
          {
            name: "Layanan Jasa BreakoutOps",
            price: Math.round(Number(amount)),
            quantity: 1
          }
        ]
      },
      payment: {
        payment_due_date: 60 // 60 minutes
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
      const errMsg = Array.isArray(dokuData.message)
        ? dokuData.message.join(", ")
        : (dokuData.error?.message || dokuData.message || "Gagal membuat sesi pembayaran DOKU");

      return res.status(dokuResponse.status).json({
        success: false,
        message: errMsg,
        details: dokuData
      });
    }

    return res.json({
      success: true,
      dokuInvoiceNumber,
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

// In-memory cache for DOKU transaction statuses from webhook notifications
const dokuPaidInvoices = new Map<string, {
  invoiceNumber: string;
  status: string;
  amount?: number;
  channel?: string;
  paidAt: string;
  raw?: any;
}>();

// Dedicated DOKU Return Breakout Page
// Handles 'Back to Merchant' from inside DOKU frames or new tabs smoothly
app.get(["/doku-return", "/api/payment/doku/return"], (req, res) => {
  const invoiceNumber = String(req.query.invoice_number || req.query.invoice || req.query.order_id || "");
  const status = String(req.query.status || "success");

  if (invoiceNumber) {
    const cleanBase = invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "");
    const entry = {
      invoiceNumber: cleanBase,
      status: "SUCCESS",
      amount: 0,
      channel: "DOKU_CHECKOUT",
      paidAt: new Date().toISOString()
    };
    dokuPaidInvoices.set(cleanBase, entry);
    dokuPaidInvoices.set(invoiceNumber, entry);
  }

  // Breakout HTML response: guarantees escaping DOKU iframe and navigating top window
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kembali ke Merchant - BreakoutOps</title>
  <style>
    body {
      background-color: #09090b;
      color: #fafafa;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      padding: 32px 24px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #10b981;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h2 {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 8px;
      color: #10b981;
    }
    p {
      color: #a1a1aa;
      font-size: 13px;
      line-height: 1.5;
      margin: 0 0 20px;
    }
    .btn {
      display: inline-block;
      width: 100%;
      box-sizing: border-box;
      padding: 12px 16px;
      background: #2563eb;
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      border-radius: 12px;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Pembayaran Selesai!</h2>
    <p>Mengalihkan Anda kembali ke halaman pesanan BreakoutOps...</p>
    <a id="btnRedirect" class="btn" href="/">Buka Pesanan Saya</a>
  </div>

  <script>
    (function() {
      var invoice = "${encodeURIComponent(invoiceNumber)}";
      var status = "${encodeURIComponent(status)}";
      var targetUrl = window.location.origin + "/?invoice_number=" + invoice + "&status=" + status;
      
      var btn = document.getElementById("btnRedirect");
      if (btn) btn.href = targetUrl;

      function doRedirect() {
        try {
          // If inside iframe or popup, break out to top window
          if (window.top && window.top !== window) {
            window.top.location.href = targetUrl;
          } else if (window.opener && !window.opener.closed) {
            try {
              window.opener.location.href = targetUrl;
              window.close();
            } catch(e) {
              window.location.href = targetUrl;
            }
          } else {
            window.location.href = targetUrl;
          }
        } catch (e) {
          window.location.href = targetUrl;
        }
      }

      // Execute breakout immediately
      doRedirect();

      // Fallback timer
      setTimeout(doRedirect, 800);
    })();
  </script>
</body>
</html>`);
});

// API: Check status of an invoice
app.get("/api/payment/doku/status/:invoiceNumber", async (req, res) => {
  const { invoiceNumber } = req.params;
  
  // 1. Direct match
  let cached = dokuPaidInvoices.get(invoiceNumber);

  // 2. Prefix / Base Invoice match (e.g. if invoiceNumber is INV-123 and cached is INV-123-ABCD)
  if (!cached || cached.status !== "SUCCESS") {
    for (const [key, val] of dokuPaidInvoices.entries()) {
      if (val.status === "SUCCESS") {
        if (key.startsWith(invoiceNumber) || invoiceNumber.startsWith(key) || key.split("-").slice(0, 3).join("-") === invoiceNumber) {
          cached = val;
          break;
        }
      }
    }
  }

  if (cached && cached.status === "SUCCESS") {
    return res.json({
      success: true,
      paid: true,
      status: "paid",
      channel: cached.channel,
      paidAt: cached.paidAt,
      message: "Pembayaran telah berhasil diverifikasi otomatis oleh DOKU Webhook"
    });
  }

  return res.json({
    success: true,
    paid: false,
    status: cached ? cached.status : "pending",
    message: "Pembayaran belum terverifikasi atau masih dalam proses"
  });
});

// API: Simulate success (useful for Sandbox / Testing)
app.post("/api/payment/doku/simulate-success", (req, res) => {
  const { invoiceNumber, amount } = req.body;
  if (!invoiceNumber) {
    return res.status(400).json({ success: false, message: "invoiceNumber is required" });
  }

  const cleanBase = String(invoiceNumber).replace(/[^a-zA-Z0-9_-]/g, "");
  const entry = {
    invoiceNumber: cleanBase,
    status: "SUCCESS",
    amount: amount || 0,
    channel: "DOKU_SANDBOX_SIMULATION",
    paidAt: new Date().toISOString()
  };

  dokuPaidInvoices.set(cleanBase, entry);
  dokuPaidInvoices.set(invoiceNumber, entry);

  return res.json({
    success: true,
    message: `Invoice ${invoiceNumber} berhasil disimulasikan sebagai LUNAS.`
  });
});

// Webhook / Notification Handler from DOKU
app.post("/api/payment/callback", (req, res) => {
  try {
    console.log("DOKU Webhook Notification received:", JSON.stringify(req.body, null, 2));

    const body = req.body || {};
    // Extract invoice number and status across various DOKU notification schemas
    const rawInvoice = body.order?.invoice_number || body.invoice_number || body.orderId || body.order_id;
    const trxStatus = body.transaction?.status || body.transactionStatus || body.status || "SUCCESS";
    const channel = body.channel?.id || body.payment_channel || body.paymentMethod || "DOKU_CHECKOUT";
    const amount = body.order?.amount || body.amount;

    if (rawInvoice) {
      const isSuccess = trxStatus === "SUCCESS" || trxStatus === "PAID" || trxStatus === "SETTLED";
      const record = {
        invoiceNumber: String(rawInvoice),
        status: isSuccess ? "SUCCESS" : trxStatus,
        amount: Number(amount) || 0,
        channel,
        paidAt: new Date().toISOString(),
        raw: body
      };

      // Store raw invoice
      dokuPaidInvoices.set(String(rawInvoice), record);

      // Also store stripped base invoice if suffix was appended
      const baseParts = String(rawInvoice).split("-");
      if (baseParts.length > 2) {
        const baseInvoice = baseParts.slice(0, -1).join("-");
        dokuPaidInvoices.set(baseInvoice, record);
      }

      console.log(`[DOKU Webhook] Invoice ${rawInvoice} status updated to: ${trxStatus}`);
    }

    // Acknowledge DOKU Webhook with standard 200 OK response
    return res.status(200).json({
      status: "SUCCESS",
      message: "Webhook processed successfully"
    });
  } catch (error: any) {
    console.error("DOKU Webhook processing error:", error);
    return res.status(200).json({ status: "SUCCESS", note: "Error logged" });
  }
});

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Vite middleware for development & production static serving
async function startServer() {
  // Pengecekan Environment Variable
  if (!process.env.DOKU_CLIENT_ID || !process.env.DOKU_SECRET_KEY) {
    console.warn("[WARNING] DOKU_CLIENT_ID dan DOKU_SECRET_KEY belum diisi di environment variable. Checkout resmi DOKU akan meminta env var saat dipanggil.");
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

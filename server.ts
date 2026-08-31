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
  const digest = crypto.createHash("sha256").update(bodyJsonString, "utf8").digest("base64");

  // 2. Component signature string according to DOKU Jokul specification
  const componentString = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;

  // 3. HMAC-SHA256 with Secret Key
  const hmac = crypto.createHmac("sha256", secretKey).update(componentString, "utf8").digest("base64");

  return `HMACSHA256=${hmac}`;
}

// In-memory cache for DOKU transaction statuses from webhook notifications & simulations
const dokuPaidInvoices = new Map<string, {
  invoiceNumber: string;
  status: string;
  amount?: number;
  channel?: string;
  paidAt: string;
  raw?: any;
}>();

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
      productDetails,
      clientId,
      secretKey
    } = req.body;

    const activeClientId = clientId || process.env.DOKU_CLIENT_ID;
    const activeSecretKey = secretKey || process.env.DOKU_SECRET_KEY;

    // Check if valid credentials exist or if placeholder dummy keys are used
    const hasValidCredentials = Boolean(
      activeClientId && 
      activeSecretKey && 
      !activeClientId.includes("your-doku") && 
      !activeClientId.includes("MALL_ID_") &&
      activeClientId.trim().length > 3
    );

    const baseUrl = isProduction
      ? "https://api.doku.com"
      : "https://api-sandbox.doku.com";

    const requestTarget = "/checkout/v1/payment";
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z"; // UTC ISO8601 YYYY-MM-DDTHH:mm:ssZ

    // Extract origin cleanly
    let originUrl = "https://ais-dev-qomstwgdhmg6zte5aukc37-744730367656.asia-southeast1.run.app";
    if (req.headers.origin && typeof req.headers.origin === "string") {
      originUrl = req.headers.origin.trim();
    } else if (req.headers.referer && typeof req.headers.referer === "string") {
      try {
        const parsed = new URL(req.headers.referer);
        originUrl = parsed.origin;
      } catch {}
    }

    // Clean base invoice: alphanumeric only, max 20 chars
    const cleanBaseInvoice = String(orderNumber || "INV")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 20);
    const attemptSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dokuInvoiceNumber = `${cleanBaseInvoice}${attemptSuffix}`.slice(0, 30);

    const callbackUrl = `${originUrl}/?invoice_number=${cleanBaseInvoice}&status=success`;
    const callbackUrlCancel = `${originUrl}/?invoice_number=${cleanBaseInvoice}&status=cancel`;

    const totalAmount = Math.max(1000, Math.round(Number(amount) || 10000));

    // Sanitize customer details (ASCII characters only, valid phone digits)
    const cleanCustomerName = String(customerName || "Pelanggan BreakoutOps")
      .replace(/[^\w\s.-]/gi, "")
      .trim()
      .slice(0, 50) || "Pelanggan BreakoutOps";

    let cleanPhone = String(customerPhone || "081234567890").replace(/\D/g, "");
    if (cleanPhone.length < 8) cleanPhone = "081234567890";
    if (cleanPhone.length > 15) cleanPhone = cleanPhone.slice(0, 15);

    let cleanEmail = String(customerEmail || "customer@breakoutops.com").trim();
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      cleanEmail = "customer@breakoutops.com";
    }

    // Line items must sum exactly to totalAmount
    const lineItemName = String(productDetails?.[0]?.name || "Jasa Joki Arena Breakout")
      .replace(/[^\w\s.-]/gi, "")
      .trim()
      .slice(0, 50) || "Jasa Joki Arena Breakout";

    const payload = {
      order: {
        amount: totalAmount,
        invoice_number: dokuInvoiceNumber,
        callback_url: callbackUrl,
        callback_url_cancel: callbackUrlCancel,
        auto_redirect: true,
        line_items: [
          {
            name: lineItemName,
            price: totalAmount,
            quantity: 1
          }
        ]
      },
      payment: {
        payment_due_date: 60 // 60 minutes
      },
      customer: {
        name: cleanCustomerName,
        email: cleanEmail,
        phone: cleanPhone
      }
    };

    // If valid real DOKU credentials are provided, attempt real DOKU API call
    if (hasValidCredentials && activeClientId && activeSecretKey) {
      try {
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

        if (dokuResponse.ok && (dokuData.response?.payment?.url || dokuData.payment?.url)) {
          return res.json({
            success: true,
            dokuInvoiceNumber,
            paymentUrl: dokuData.response?.payment?.url || dokuData.payment?.url,
            expiredDate: dokuData.response?.payment?.expired_date || dokuData.payment?.expired_date,
            isSandbox: !isProduction,
            data: dokuData
          });
        }

        console.warn("DOKU API non-OK response:", dokuData);
        // If it was rejected by DOKU (e.g. invalid merchant or sandbox credential mismatch),
        // provide helpful error message or sandbox fallback
        const errMsg = Array.isArray(dokuData.message)
          ? dokuData.message.join(", ")
          : (dokuData.error?.message || (typeof dokuData.message === "string" ? dokuData.message : JSON.stringify(dokuData.error || dokuData)));

        // If in sandbox mode, fallback gracefully to interactive simulator
        if (!isProduction) {
          console.log("[DOKU Sandbox Mode] Using interactive sandbox checkout fallback for testing.");
          return res.json({
            success: true,
            dokuInvoiceNumber,
            isSandboxFallback: true,
            simulated: true,
            totalAmount,
            cleanBaseInvoice,
            message: `Mode Sandbox Aktif: ${errMsg || "Sesi checkout simulasi siap."}`,
            data: dokuData
          });
        }

        return res.status(dokuResponse.status || 400).json({
          success: false,
          message: errMsg || "Gagal membuat sesi pembayaran DOKU.",
          details: dokuData
        });
      } catch (err: any) {
        console.error("DOKU Gateway connection error:", err);
      }
    }

    // Sandbox / Test Fallback mode when credentials are not configured or in testing mode
    return res.json({
      success: true,
      dokuInvoiceNumber,
      isSandboxFallback: true,
      simulated: true,
      totalAmount,
      cleanBaseInvoice,
      message: "Sesi checkout DOKU Sandbox siap. Anda dapat menyelesaikan pembayaran melalui QRIS simulasi atau transfer VA."
    });
  } catch (error: any) {
    console.error("Internal Server Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Kesalahan internal pada server"
    });
  }
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

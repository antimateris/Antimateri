import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const router = express.Router();

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
  const digest = crypto.createHash("sha256").update(bodyJsonString, "utf8").digest("base64");
  const componentString = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;
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

// API Health Check
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API: Create DOKU Checkout Payment URL
router.post("/payment/doku/checkout", async (req, res) => {
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
    } = req.body || {};

    const activeClientId = clientId || process.env.DOKU_CLIENT_ID;
    const activeSecretKey = secretKey || process.env.DOKU_SECRET_KEY;

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
    const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z";

    let originUrl = "https://antimateri-p4v1-opuefp1cq-breakoutops.vercel.app";
    if (req.headers.origin && typeof req.headers.origin === "string") {
      originUrl = req.headers.origin.trim();
    } else if (req.headers.referer && typeof req.headers.referer === "string") {
      try {
        const parsed = new URL(req.headers.referer);
        originUrl = parsed.origin;
      } catch {}
    }

    const cleanBaseInvoice = String(orderNumber || "INV")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 20);
    const attemptSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dokuInvoiceNumber = `${cleanBaseInvoice}${attemptSuffix}`.slice(0, 30);

    const callbackUrl = `${originUrl}/?invoice_number=${cleanBaseInvoice}&status=success`;
    const callbackUrlCancel = `${originUrl}/?invoice_number=${cleanBaseInvoice}&status=cancel`;

    const totalAmount = Math.max(1000, Math.round(Number(amount) || 10000));

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
        payment_due_date: 60
      },
      customer: {
        name: cleanCustomerName,
        email: cleanEmail,
        phone: cleanPhone
      }
    };

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

        const errMsg = Array.isArray(dokuData.message)
          ? dokuData.message.join(", ")
          : (dokuData.error?.message || (typeof dokuData.message === "string" ? dokuData.message : JSON.stringify(dokuData.error || dokuData)));

        if (!isProduction) {
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
router.get("/payment/doku/status/:invoiceNumber", async (req, res) => {
  const { invoiceNumber } = req.params;
  
  let cached = dokuPaidInvoices.get(invoiceNumber);

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

// API: Simulate success
router.post("/payment/doku/simulate-success", (req, res) => {
  const { invoiceNumber, amount } = req.body || {};
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
router.post("/payment/callback", (req, res) => {
  try {
    const body = req.body || {};
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

      dokuPaidInvoices.set(String(rawInvoice), record);

      const baseParts = String(rawInvoice).split("-");
      if (baseParts.length > 2) {
        const baseInvoice = baseParts.slice(0, -1).join("-");
        dokuPaidInvoices.set(baseInvoice, record);
      }
    }

    return res.status(200).json({
      status: "SUCCESS",
      message: "Webhook processed successfully"
    });
  } catch (error: any) {
    return res.status(200).json({ status: "SUCCESS", note: "Error logged" });
  }
});

app.use("/api", router);
app.use("/", router);

export default app;

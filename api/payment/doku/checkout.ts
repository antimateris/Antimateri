import { generateDokuSignature } from "../../_utils/doku";

export default async function handler(req: any, res: any) {
  // Only accept POST method
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Use POST."
    });
  }

  try {
    // 1. KEAMANAN KRITIS: WAJIB DARI ENVIRONMENT VARIABLE TANPA FALLBACK
    const clientId = process.env.DOKU_CLIENT_ID?.trim();
    const secretKey = process.env.DOKU_SECRET_KEY?.trim();

    if (!clientId || !secretKey) {
      console.error("[DOKU Checkout] Missing required DOKU environment variables (DOKU_CLIENT_ID, DOKU_SECRET_KEY).");
      return res.status(500).json({
        success: false,
        message: "DOKU credentials not configured"
      });
    }

    const {
      isProduction: reqIsProduction,
      orderNumber,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      productDetails,
    } = req.body || {};

    const isProduction =
      process.env.DOKU_ENVIRONMENT === "production" ||
      process.env.DOKU_MODE === "production" ||
      reqIsProduction === true;

    const baseUrl = isProduction
      ? "https://api.doku.com"
      : "https://api-sandbox.doku.com";

    const requestTarget = "/checkout/v1/payment";
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z"; // UTC ISO8601 YYYY-MM-DDTHH:mm:ssZ

    // Extract caller origin cleanly for callback redirects
    let originUrl = process.env.APP_URL?.trim() || "";
    if (req.headers.origin && typeof req.headers.origin === "string") {
      originUrl = req.headers.origin.trim();
    } else if (req.headers.referer && typeof req.headers.referer === "string") {
      try {
        const parsed = new URL(req.headers.referer);
        originUrl = parsed.origin;
      } catch {}
    }

    if (!originUrl) {
      originUrl = "https://breakoutops.com";
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

    const bodyJsonString = JSON.stringify(payload);
    const signature = generateDokuSignature({
      clientId,
      requestId,
      requestTimestamp,
      requestTarget,
      bodyJsonString,
      secretKey
    });

    const dokuResponse = await fetch(`${baseUrl}${requestTarget}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": clientId,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        "Signature": signature
      },
      body: bodyJsonString
    });

    const dokuData = await dokuResponse.json().catch(() => ({}));

    if (dokuResponse.ok && (dokuData.response?.payment?.url || dokuData.payment?.url)) {
      return res.status(200).json({
        success: true,
        dokuInvoiceNumber,
        paymentUrl: dokuData.response?.payment?.url || dokuData.payment?.url,
        expiredDate: dokuData.response?.payment?.expired_date || dokuData.payment?.expired_date,
        isSandbox: !isProduction,
        data: dokuData
      });
    }

    console.warn("DOKU API Error response:", dokuData);
    const errMsg = Array.isArray(dokuData.message)
      ? dokuData.message.join(", ")
      : (dokuData.error?.message || (typeof dokuData.message === "string" ? dokuData.message : JSON.stringify(dokuData.error || dokuData)));

    return res.status(dokuResponse.status || 400).json({
      success: false,
      message: errMsg || "Gagal membuat sesi pembayaran DOKU.",
      details: dokuData
    });
  } catch (error: any) {
    console.error("Internal DOKU Checkout Serverless Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Kesalahan internal pada server"
    });
  }
}

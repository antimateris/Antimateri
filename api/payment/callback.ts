import { dokuPaidInvoices } from "../_utils/doku";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "FAILED",
      message: "Method not allowed. Use POST."
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    console.log("DOKU Webhook Notification received:", JSON.stringify(body, null, 2));

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

      // Store in memory
      dokuPaidInvoices.set(String(rawInvoice), record);

      // Also store stripped base invoice if suffix was appended (e.g. INV123456ABCD -> INV123456)
      const baseParts = String(rawInvoice).split("-");
      if (baseParts.length > 2) {
        const baseInvoice = baseParts.slice(0, -1).join("-");
        dokuPaidInvoices.set(baseInvoice, record);
      }

      console.log(`[DOKU Webhook] Invoice ${rawInvoice} status successfully recorded: ${trxStatus}`);
    }

    // Always acknowledge DOKU Webhook with 200 OK
    return res.status(200).json({
      status: "SUCCESS",
      message: "Webhook processed successfully"
    });
  } catch (error: any) {
    console.error("DOKU Webhook processing error:", error);
    return res.status(200).json({
      status: "SUCCESS",
      note: "Error logged but acknowledged"
    });
  }
}

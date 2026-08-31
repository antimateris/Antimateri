import { dokuPaidInvoices } from "../../../_utils/doku";

export default async function handler(req: any, res: any) {
  const rawInvoice = req.query?.invoiceNumber || req.query?.invoice || req.query?.slug || "";
  const invoiceNumber = String(rawInvoice).trim();

  if (!invoiceNumber) {
    return res.status(400).json({
      success: false,
      message: "invoiceNumber parameter is required"
    });
  }

  // 1. Direct match
  let cached = dokuPaidInvoices.get(invoiceNumber);

  // 2. Prefix / Base Invoice match (e.g. if invoiceNumber is INV-123 and cached is INV-123-ABCD)
  if (!cached || cached.status !== "SUCCESS") {
    for (const [key, val] of dokuPaidInvoices.entries()) {
      if (val.status === "SUCCESS") {
        if (
          key.startsWith(invoiceNumber) ||
          invoiceNumber.startsWith(key) ||
          key.split("-").slice(0, 3).join("-") === invoiceNumber
        ) {
          cached = val;
          break;
        }
      }
    }
  }

  if (cached && (cached.status === "SUCCESS" || cached.status === "PAID" || cached.status === "SETTLED")) {
    return res.status(200).json({
      success: true,
      paid: true,
      status: "paid",
      channel: cached.channel,
      paidAt: cached.paidAt,
      message: "Pembayaran telah berhasil diverifikasi oleh DOKU Webhook"
    });
  }

  return res.status(200).json({
    success: true,
    paid: false,
    status: cached ? cached.status : "pending",
    message: "Pembayaran belum terverifikasi atau masih dalam proses"
  });
}

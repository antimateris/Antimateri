import crypto from "crypto";

export interface PaidInvoiceRecord {
  invoiceNumber: string;
  status: string;
  amount?: number;
  channel?: string;
  paidAt: string;
  raw?: any;
}

// Global in-memory cache to preserve state across invocations in warm serverless instances
declare global {
  var __dokuPaidInvoices: Map<string, PaidInvoiceRecord> | undefined;
}

export const dokuPaidInvoices: Map<string, PaidInvoiceRecord> =
  globalThis.__dokuPaidInvoices || (globalThis.__dokuPaidInvoices = new Map<string, PaidInvoiceRecord>());

/**
 * Generates HMAC-SHA256 signature according to DOKU Jokul specification.
 */
export function generateDokuSignature({
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
}): string {
  // 1. Digest calculation: Base64(SHA256(Body))
  const digest = crypto.createHash("sha256").update(bodyJsonString, "utf8").digest("base64");

  // 2. Component signature string according to DOKU Jokul specification
  const componentString = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${requestTimestamp}\nRequest-Target:${requestTarget}\nDigest:${digest}`;

  // 3. HMAC-SHA256 with Secret Key
  const hmac = crypto.createHmac("sha256", secretKey).update(componentString, "utf8").digest("base64");

  return `HMACSHA256=${hmac}`;
}

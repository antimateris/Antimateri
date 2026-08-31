export default async function handler(req: any, res: any) {
  const hasClientId = Boolean(process.env.DOKU_CLIENT_ID?.trim());
  const hasSecretKey = Boolean(process.env.DOKU_SECRET_KEY?.trim());

  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    dokuConfigured: hasClientId && hasSecretKey,
    environment: process.env.DOKU_ENVIRONMENT || process.env.DOKU_MODE || "sandbox"
  });
}

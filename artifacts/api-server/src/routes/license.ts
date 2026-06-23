import { Router } from "express";

const router = Router();

const GUMROAD_PRODUCT_ID = process.env["GUMROAD_PRODUCT_ID"] ?? "bjtysz";
const GUMROAD_TIMEOUT_MS = 8_000;

router.post("/verify-license", async (req, res) => {
  const { license_key } = req.body as { license_key?: string };

  if (!license_key || typeof license_key !== "string" || !license_key.trim()) {
    res.status(400).json({ success: false, message: "License key is required." });
    return;
  }

  const params = new URLSearchParams({
    product_id: GUMROAD_PRODUCT_ID,
    license_key: license_key.trim(),
  });

  try {
    const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: AbortSignal.timeout(GUMROAD_TIMEOUT_MS),
    });

    const data = (await gumroadRes.json()) as {
      success: boolean;
      uses?: number;
      purchase?: { refunded: boolean; chargebacked: boolean };
      message?: string;
    };

    if (!data.success) {
      res.status(200).json({ success: false, message: "Invalid license key. Please check your key and try again." });
      return;
    }

    if (data.purchase?.refunded || data.purchase?.chargebacked) {
      res.status(200).json({ success: false, message: "This license has been refunded or reversed." });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    const isTimeout = err instanceof DOMException && err.name === "TimeoutError";
    req.log.error({ err }, isTimeout ? "Gumroad license verify timed out" : "Gumroad license verify failed");
    res.status(502).json({ success: false, message: "Could not reach the license server. Please try again." });
  }
});

export default router;

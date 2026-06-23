import { Router } from "express";

const router = Router();

const GUMROAD_PRODUCT_ID = "bjtysz";

router.post("/verify-license", async (req, res) => {
  const { license_key } = req.body as { license_key?: string };

  if (!license_key || typeof license_key !== "string" || !license_key.trim()) {
    res.status(400).json({ success: false, message: "License key is required." });
    return;
  }

  try {
    const params = new URLSearchParams({
      product_id: GUMROAD_PRODUCT_ID,
      license_key: license_key.trim(),
    });

    const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
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
    req.log.error({ err }, "Gumroad license verify failed");
    res.status(502).json({ success: false, message: "Could not reach the license server. Please try again." });
  }
});

export default router;

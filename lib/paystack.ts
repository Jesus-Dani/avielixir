const PAYSTACK_BASE = "https://api.paystack.co";

interface InitializeResult {
  status: boolean;
  message: string;
  data: { authorization_url: string; access_code: string; reference: string };
}

/** Initializes a Paystack transaction for the order subtotal only, never delivery fee. */
export async function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
}): Promise<InitializeResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      channels: ["card", "bank_transfer", "ussd"],
      currency: "NGN",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack initialize failed: ${res.status} ${body}`);
  }

  return res.json();
}

interface VerifyResult {
  status: boolean;
  message: string;
  data: { status: "success" | "failed" | "abandoned"; reference: string; amount: number };
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Paystack verify failed: ${res.status} ${body}`);
  }

  return res.json();
}

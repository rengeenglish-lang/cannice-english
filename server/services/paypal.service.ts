import "server-only";
import { getPaypalCredentials } from "@/server/env";

async function getAccessToken() {
  const { clientId, clientSecret, baseUrl } = getPaypalCredentials();
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`PayPal auth failed: ${response.status} ${await response.text()}`);
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function createPaypalOrder(usdAmount: string, referenceId: string) {
  const { baseUrl } = getPaypalCredentials();
  const accessToken = await getAccessToken();
  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ reference_id: referenceId, amount: { currency_code: "USD", value: usdAmount } }],
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`PayPal order creation failed: ${response.status} ${await response.text()}`);
  return (await response.json()) as { id: string; status: string };
}

export async function capturePaypalOrder(paypalOrderId: string) {
  const { baseUrl } = getPaypalCredentials();
  const accessToken = await getAccessToken();
  const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`PayPal capture failed: ${response.status} ${await response.text()}`);
  return (await response.json()) as { id: string; status: string };
}

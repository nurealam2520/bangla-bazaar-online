import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/** Fetch a CJ access token, cached in app_config until near expiry. */
async function getAccessToken(supabase: ReturnType<typeof createClient>): Promise<string> {
  const { data: cached } = await supabase
    .from("app_config")
    .select("key, value")
    .in("key", ["cj_access_token", "cj_token_expiry"]);

  const map: Record<string, string> = {};
  cached?.forEach((c: { key: string; value: string }) => (map[c.key] = c.value));

  if (map.cj_access_token && map.cj_token_expiry && Date.parse(map.cj_token_expiry) - Date.now() > 5 * 60 * 1000) {
    return map.cj_access_token;
  }

  const email = Deno.env.get("CJ_EMAIL");
  const apiKey = Deno.env.get("CJ_API_KEY");
  if (!email || !apiKey) throw new Error("CJ credentials are not configured");

  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: apiKey }),
  });
  const json = await res.json();
  if (!json?.result || !json?.data?.accessToken) {
    throw new Error(json?.message || "CJ authentication failed");
  }

  const token = json.data.accessToken as string;
  const expiry = json.data.accessTokenExpiryDate
    ? new Date(json.data.accessTokenExpiryDate).toISOString()
    : new Date(Date.now() * 1 + 12 * 60 * 60 * 1000).toISOString();

  await supabase.from("app_config").upsert(
    [
      { key: "cj_access_token", value: token },
      { key: "cj_token_expiry", value: expiry },
    ],
    { onConflict: "key" },
  );

  return token;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  let orderId: string | null = null;

  try {
    const body = await req.json();
    orderId = body?.order_id ?? null;
    if (!orderId) {
      return new Response(JSON.stringify({ error: "order_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (orderErr || !order) throw new Error("Order not found");

    if (order.cj_order_id) {
      return new Response(
        JSON.stringify({ success: true, already_synced: true, cj_order_id: order.cj_order_id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);
    if (itemsErr) throw itemsErr;

    const products = (items || [])
      .filter((i: Record<string, unknown>) => i.cj_variant_id || i.cj_sku)
      .map((i: Record<string, unknown>) => ({
        vid: (i.cj_variant_id as string) || undefined,
        sku: (i.cj_sku as string) || undefined,
        quantity: Number(i.quantity) || 1,
      }));

    if (products.length === 0) {
      throw new Error("No CJ variant ID / SKU found on the order items. Add CJ variant IDs to these products.");
    }

    const token = await getAccessToken(supabase);

    const payload = {
      orderNumber: order.id,
      shippingCountryCode: order.shipping_country,
      shippingCountry: order.shipping_country,
      shippingProvince: order.shipping_state || order.shipping_city,
      shippingCity: order.shipping_city,
      shippingAddress: order.shipping_address,
      shippingCustomerName: order.shipping_name,
      shippingZip: order.shipping_postal_code,
      shippingPhone: order.shipping_phone || "",
      remark: `Pawnest order ${order.id}`,
      fromCountryCode: "CN",
      logisticName: "CJPacket Ordinary",
      payType: 3,
      products,
    };

    const cjRes = await fetch(`${CJ_BASE}/shopping/order/createOrder`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "CJ-Access-Token": token },
      body: JSON.stringify(payload),
    });
    const cjJson = await cjRes.json();

    if (!cjRes.ok || !cjJson?.result) {
      throw new Error(cjJson?.message || `CJ API error (${cjRes.status})`);
    }

    const cjOrderId = cjJson?.data?.orderId || cjJson?.data?.orderNum || null;

    await supabase
      .from("orders")
      .update({
        cj_order_id: cjOrderId ? String(cjOrderId) : null,
        cj_sync_status: "synced",
        cj_error: null,
        cj_synced_at: new Date().toISOString(),
        supplier_order_id: cjOrderId ? String(cjOrderId) : order.supplier_order_id,
        fulfillment_status: "ordered_from_supplier",
      })
      .eq("id", orderId);

    return new Response(JSON.stringify({ success: true, cj_order_id: cjOrderId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown CJ sync error";
    console.error("CJ sync failed:", message);

    if (orderId) {
      await supabase
        .from("orders")
        .update({ cj_sync_status: "failed", cj_error: message })
        .eq("id", orderId);
    }

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

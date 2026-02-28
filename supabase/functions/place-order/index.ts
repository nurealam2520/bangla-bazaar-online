import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_ORDERS_PER_IP = 5;
const MAX_ORDERS_PER_EMAIL = 3;

interface OrderRequest {
  items: { product_name: string; product_image: string; price: number; quantity: number }[];
  payment_method: "card" | "cod";
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: number;
  shipping: number;
  total: number;
}

function calculateFraudScore(order: OrderRequest, ip: string, orderCount: number): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // High order frequency
  if (orderCount >= MAX_ORDERS_PER_IP - 1) {
    score += 30;
    reasons.push("High order frequency from this IP");
  }

  // COD orders are riskier
  if (order.payment_method === "cod") {
    score += 15;
    reasons.push("Cash on delivery payment");
  }

  // Very high order value
  if (order.total > 500) {
    score += 20;
    reasons.push("High order value");
  }

  // Suspicious email patterns
  const email = order.shipping_email.toLowerCase();
  if (email.includes("+") || /\d{5,}/.test(email.split("@")[0])) {
    score += 25;
    reasons.push("Suspicious email pattern");
  }

  // Very short name
  if (order.shipping_name.trim().length < 3) {
    score += 15;
    reasons.push("Very short shipping name");
  }

  // Too many items
  const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
  if (totalQty > 20) {
    score += 20;
    reasons.push("Unusually large order quantity");
  }

  return { score, reasons };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const order: OrderRequest = await req.json();

    // Basic validation
    if (!order.items?.length || !order.shipping_email || !order.shipping_name) {
      return new Response(JSON.stringify({ error: "Invalid order data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting by IP
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    
    const { count: ipCount } = await supabase
      .from("order_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("identifier", ip)
      .eq("identifier_type", "ip")
      .gte("window_start", windowStart);

    if ((ipCount || 0) >= MAX_ORDERS_PER_IP) {
      return new Response(JSON.stringify({ error: "Too many orders. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Rate limiting by email
    const { count: emailCount } = await supabase
      .from("order_rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("identifier", order.shipping_email.toLowerCase())
      .eq("identifier_type", "email")
      .gte("window_start", windowStart);

    if ((emailCount || 0) >= MAX_ORDERS_PER_EMAIL) {
      return new Response(JSON.stringify({ error: "Too many orders from this email. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate fraud score
    const { score, reasons } = calculateFraudScore(order, ip, (ipCount || 0));
    const isSuspicious = score >= 50;

    // Get user_id from auth header if present
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!);
      const { data: { user } } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id || null;
    }

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        guest_email: userId ? null : order.shipping_email,
        status: isSuspicious ? "flagged" : "pending",
        payment_method: order.payment_method,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        shipping_name: order.shipping_name,
        shipping_email: order.shipping_email,
        shipping_address: order.shipping_address,
        shipping_city: order.shipping_city,
        shipping_postal_code: order.shipping_postal_code,
        shipping_country: order.shipping_country,
        ip_address: ip,
        user_agent: userAgent,
        is_suspicious: isSuspicious,
        fraud_score: score,
        fraud_reasons: reasons.length > 0 ? reasons : null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = order.items.map((item) => ({
      order_id: orderData.id,
      product_name: item.product_name,
      product_image: item.product_image,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    // Record rate limit entries
    await supabase.from("order_rate_limits").insert([
      { identifier: ip, identifier_type: "ip", window_start: new Date().toISOString() },
      { identifier: order.shipping_email.toLowerCase(), identifier_type: "email", window_start: new Date().toISOString() },
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: orderData.id,
        status: orderData.status,
        message: isSuspicious
          ? "Your order is under review. We'll confirm it shortly."
          : "Order placed successfully!",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Order error:", error);
    return new Response(JSON.stringify({ error: "Failed to place order. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

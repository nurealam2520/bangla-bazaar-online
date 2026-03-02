import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutItem {
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CheckoutRequest {
  items: CheckoutItem[];
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: number;
  shipping: number;
  total: number;
  success_url: string;
  cancel_url: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Try env var first, then app_config table
    let stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data } = await supabase.from("app_config").select("value").eq("key", "STRIPE_SECRET_KEY").maybeSingle();
      stripeKey = data?.value || null;
    }
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured yet. Please add STRIPE_SECRET_KEY in admin settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: CheckoutRequest = await req.json();

    if (!body.items?.length || !body.shipping_email) {
      return new Response(
        JSON.stringify({ error: "Invalid checkout data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Stripe line items
    const line_items = body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping as line item if not free
    if (body.shipping > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
            images: [],
          },
          unit_amount: Math.round(body.shipping * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "mode": "payment",
        "success_url": body.success_url || `${req.headers.get("origin")}/checkout?success=true`,
        "cancel_url": body.cancel_url || `${req.headers.get("origin")}/checkout?canceled=true`,
        "customer_email": body.shipping_email,
        ...Object.fromEntries(
          line_items.flatMap((item, i) => [
            [`line_items[${i}][price_data][currency]`, item.price_data.currency],
            [`line_items[${i}][price_data][product_data][name]`, item.price_data.product_data.name],
            ...item.price_data.product_data.images.map((img, j) => [
              `line_items[${i}][price_data][product_data][images][${j}]`, img
            ]),
            [`line_items[${i}][price_data][unit_amount]`, String(item.price_data.unit_amount)],
            [`line_items[${i}][quantity]`, String(item.quantity)],
          ])
        ),
        "metadata[shipping_name]": body.shipping_name,
        "metadata[shipping_address]": body.shipping_address,
        "metadata[shipping_city]": body.shipping_city,
        "metadata[shipping_postal_code]": body.shipping_postal_code,
        "metadata[shipping_country]": body.shipping_country,
      }).toString(),
    });

    const session = await stripeRes.json();

    if (session.error) {
      console.error("Stripe error:", session.error);
      return new Response(
        JSON.stringify({ error: session.error.message || "Stripe checkout failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

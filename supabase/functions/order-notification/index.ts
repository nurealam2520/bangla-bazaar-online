import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { order_id, new_status, tracking_number, tracking_url } = await req.json();

    if (!order_id || !new_status) {
      return new Response(JSON.stringify({ error: "order_id and new_status required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order
    const updateData: Record<string, unknown> = { status: new_status };
    if (tracking_number) updateData.tracking_number = tracking_number;
    if (tracking_url) updateData.tracking_url = tracking_url;

    const { data: order, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", order_id)
      .select("shipping_email, shipping_name, total, tracking_number, tracking_url, id")
      .single();

    if (error) throw error;

    // Build email notification (log for now - can integrate with email service later)
    const emailData = {
      to: order.shipping_email,
      subject: getEmailSubject(new_status),
      body: getEmailBody(order, new_status),
    };

    console.log("Email notification:", JSON.stringify(emailData));

    return new Response(
      JSON.stringify({ success: true, message: `Order updated to ${new_status}`, email_queued: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(JSON.stringify({ error: "Failed to update order" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getEmailSubject(status: string): string {
  switch (status) {
    case "confirmed": return "Your order has been confirmed! 🎉";
    case "shipped": return "Your order has been shipped! 📦";
    case "delivered": return "Your order has been delivered! ✅";
    case "cancelled": return "Your order has been cancelled";
    default: return `Order status update: ${status}`;
  }
}

function getEmailBody(order: Record<string, unknown>, status: string): string {
  const name = order.shipping_name as string;
  const total = Number(order.total).toFixed(2);
  const orderId = (order.id as string).slice(0, 8);
  const tracking = order.tracking_number as string | null;
  const trackingUrl = order.tracking_url as string | null;

  let body = `Hi ${name},\n\n`;

  switch (status) {
    case "confirmed":
      body += `Great news! Your order #${orderId} ($${total}) has been confirmed and is being prepared.\n`;
      break;
    case "shipped":
      body += `Your order #${orderId} ($${total}) has been shipped!\n`;
      if (tracking) {
        body += `\nTracking Number: ${tracking}\n`;
        if (trackingUrl) body += `Track your package: ${trackingUrl}\n`;
      }
      break;
    case "delivered":
      body += `Your order #${orderId} has been delivered. We hope you love your purchase!\n`;
      break;
    case "cancelled":
      body += `Your order #${orderId} has been cancelled. If you have questions, please contact us.\n`;
      break;
    default:
      body += `Your order #${orderId} status has been updated to: ${status}\n`;
  }

  body += `\nThank you for shopping with PawNest! 🐾\n`;
  return body;
}

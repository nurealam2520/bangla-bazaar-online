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
      .select("*")
      .single();

    if (error) throw error;

    // Send email to customer
    const customerEmailData = {
      to: order.shipping_email,
      subject: getEmailSubject(new_status),
      html: getEmailHtml(order, new_status),
      body: getEmailBody(order, new_status),
    };

    // Send email to admin for new orders
    const adminEmailData = {
      to: "neworder@compawnest.com",
      subject: `🐾 Order #${order.id.slice(0, 8)} — ${new_status.toUpperCase()}`,
      html: getAdminEmailHtml(order, new_status),
      body: `Order #${order.id.slice(0, 8)} status: ${new_status}\nCustomer: ${order.shipping_name} (${order.shipping_email})\nTotal: $${Number(order.total).toFixed(2)}`,
    };

    // Send both emails via send-email function
    const sendEmail = async (emailData: Record<string, string>) => {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify(emailData),
        });
        return await res.json();
      } catch (e) {
        console.error("Email send failed:", e);
        return { success: false, error: e.message };
      }
    };

    const [customerResult, adminResult] = await Promise.all([
      sendEmail(customerEmailData),
      sendEmail(adminEmailData),
    ]);

    console.log("Customer email:", JSON.stringify(customerResult));
    console.log("Admin email:", JSON.stringify(adminResult));

    return new Response(
      JSON.stringify({ success: true, message: `Order updated to ${new_status}`, email_sent: true }),
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
      body += `Great news! Your order #${orderId} ($${total}) has been confirmed.\n`;
      break;
    case "shipped":
      body += `Your order #${orderId} ($${total}) has been shipped!\n`;
      if (tracking) {
        body += `\nTracking Number: ${tracking}\n`;
        if (trackingUrl) body += `Track your package: ${trackingUrl}\n`;
      }
      break;
    case "delivered":
      body += `Your order #${orderId} has been delivered!\n`;
      break;
    case "cancelled":
      body += `Your order #${orderId} has been cancelled.\n`;
      break;
    default:
      body += `Your order #${orderId} status: ${status}\n`;
  }
  body += `\nThank you for shopping with PawNest! 🐾\n`;
  return body;
}

function getEmailHtml(order: Record<string, unknown>, status: string): string {
  const name = order.shipping_name as string;
  const total = Number(order.total).toFixed(2);
  const orderId = (order.id as string).slice(0, 8);
  const tracking = order.tracking_number as string | null;
  const trackingUrl = order.tracking_url as string | null;

  let statusMsg = "";
  let statusColor = "#16a34a";
  switch (status) {
    case "confirmed":
      statusMsg = `Your order #${orderId} ($${total}) has been confirmed and is being prepared.`;
      break;
    case "shipped":
      statusMsg = `Your order #${orderId} ($${total}) has been shipped!`;
      statusColor = "#2563eb";
      break;
    case "delivered":
      statusMsg = `Your order #${orderId} has been delivered!`;
      statusColor = "#059669";
      break;
    case "cancelled":
      statusMsg = `Your order #${orderId} has been cancelled.`;
      statusColor = "#dc2626";
      break;
    default:
      statusMsg = `Your order #${orderId} status: ${status}`;
  }

  let trackingHtml = "";
  if (tracking && status === "shipped") {
    trackingHtml = `<p style="margin-top:12px;padding:12px;background:#f0f9ff;border-radius:8px;">
      <strong>Tracking:</strong> ${tracking}
      ${trackingUrl ? `<br><a href="${trackingUrl}" style="color:#2563eb;">Track your package →</a>` : ""}
    </p>`;
  }

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="font-size:24px;color:${statusColor};">🐾 PawNest</h1>
      </div>
      <h2 style="color:${statusColor};">${getEmailSubject(status)}</h2>
      <p>Hi ${name},</p>
      <p>${statusMsg}</p>
      ${trackingHtml}
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee;">
      <p style="font-size:12px;color:#999;text-align:center;">Thank you for shopping with PawNest! 🐾</p>
    </div>
  `;
}

function getAdminEmailHtml(order: Record<string, unknown>, status: string): string {
  const orderId = (order.id as string).slice(0, 8);
  const total = Number(order.total).toFixed(2);
  const subtotal = Number(order.subtotal).toFixed(2);
  const shipping = Number(order.shipping).toFixed(2);

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#16a34a;">🐾 Order Update — #${orderId}</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Status</td><td style="padding:8px;border-bottom:1px solid #eee;text-transform:uppercase;font-weight:bold;">${status}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Customer</td><td style="padding:8px;border-bottom:1px solid #eee;">${order.shipping_name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${order.shipping_email}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Address</td><td style="padding:8px;border-bottom:1px solid #eee;">${order.shipping_address}, ${order.shipping_city}, ${order.shipping_country} ${order.shipping_postal_code}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Payment</td><td style="padding:8px;border-bottom:1px solid #eee;">${order.payment_method}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Subtotal</td><td style="padding:8px;border-bottom:1px solid #eee;">$${subtotal}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Shipping</td><td style="padding:8px;border-bottom:1px solid #eee;">$${shipping}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Total</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;font-size:18px;">$${total}</td></tr>
      </table>
      ${order.is_suspicious ? '<p style="margin-top:16px;padding:12px;background:#fef2f2;border-radius:8px;color:#dc2626;font-weight:bold;">⚠️ SUSPICIOUS ORDER — Fraud Score: ' + order.fraud_score + '</p>' : ''}
    </div>
  `;
}

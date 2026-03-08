import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, body, html } = await req.json();

    if (!to || !subject || (!body && !html)) {
      return new Response(JSON.stringify({ error: "to, subject, and body/html are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = Deno.env.get("SMTP_PORT");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const smtpFrom = Deno.env.get("SMTP_FROM") || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error("SMTP not configured. Email logged:", JSON.stringify({ to, subject }));
      return new Response(JSON.stringify({ success: false, error: "SMTP not configured", logged: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const client = new SmtpClient();

    await client.connectTLS({
      hostname: smtpHost,
      port: parseInt(smtpPort || "465"),
      username: smtpUser,
      password: smtpPass,
    });

    await client.send({
      from: smtpFrom!,
      to,
      subject,
      content: body || "",
      html: html || undefined,
    });

    await client.close();

    console.log("Email sent successfully to:", to);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Send email error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

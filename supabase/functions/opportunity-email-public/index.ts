import { serve } from "https://deno.land/std@0.177.1/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
    const SUPABASE_URL = Deno.env.get("PROJECT_URL");
    // Remote PNG fallback (data URIs are blocked by many email clients)
    // No image for now; use styled text branding.
    const LOGO_TEXT = "InternConnect";

    const hasResend = !!RESEND_API_KEY;
    const hasService = !!SERVICE_ROLE_KEY;
    const hasUrl = !!SUPABASE_URL;
    console.log("env check", { hasResend, hasService, hasUrl });

    if (!hasResend || !hasService || !hasUrl) {
      console.error("Missing env vars for opportunity-email-public");
      return new Response("env not configured", { status: 500, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const resend = new Resend(RESEND_API_KEY);
    const FROM = Deno.env.get("FROM_EMAIL") || "InternConnect <onboarding@resend.dev>";

    const { record } = await req.json();
    if (!record) return new Response("Missing record", { status: 400, headers: corsHeaders });

    const { data: subs, error } = await supabaseAdmin
      .from("opportunity_subscriptions")
      .select("email,categories");
    if (error) throw error;

    // Deduplicate by email and filter on category
    const uniqueSubs = Array.from(
      new Map((subs || []).map((s) => [s.email, s])).values()
    );

    const interested = uniqueSubs.filter((s) => {
      if (!s.categories || s.categories.length === 0) return true;
      if (!record.category) return true;
      return s.categories.includes(record.category);
    });

    if (interested.length === 0) return new Response("No subscribers", { status: 200, headers: corsHeaders });

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,sans-serif;color:#111;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f8fb;padding:24px;">
            <tr>
              <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);">
                  <tr>
                    <td style="padding:20px 24px 10px 24px; text-align:left;">
                      <div style="font-weight:800;font-size:20px;color:#7c3aed;line-height:1.1;margin-bottom:4px;">${LOGO_TEXT}</div>
                      <div style="font-size:13px;color:#6b7280;">New opportunity just landed</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 24px 16px 24px;">
                      <h2 style="margin:8px 0 6px 0;font-size:20px;color:#0f172a;">${record.title}</h2>
                      <p style="margin:0 0 12px 0;font-size:14px;line-height:1.5;color:#1f2937;">${record.description || ""}</p>
                      <p style="margin:0 0 12px 0;font-size:13px;color:#4b5563;"><strong>Location:</strong> ${record.location || "Remote"}</p>
                      ${record.category ? `<span style="display:inline-block;padding:6px 10px;border-radius:9999px;background:#eef2ff;color:#4338ca;font-size:12px;font-weight:600;">${record.category}</span>` : ""}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 24px 24px 24px;">
                      <a href="${record.apply_url || "#"}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#2563eb;color:#fff;font-size:14px;font-weight:600;text-decoration:none;">View details / Apply</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 24px 20px 24px;border-top:1px solid #e5e7eb;">
                      <p style="margin:0;font-size:12px;color:#6b7280;">
                        You’re receiving this because you subscribed to opportunity alerts on InternConnect.
                        If you prefer fewer categories, update your preferences in the app.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const text = `New opportunity: ${record.title}
${record.description || ""}
Location: ${record.location || "Remote"}
Apply: ${record.apply_url || "N/A"}`;

    const sendErrors: string[] = [];

    for (const sub of interested) {
      const result = await resend.emails.send({
        from: FROM,
        to: sub.email,
        subject: `New opportunity: ${record.title}`,
        html,
        text,
      });
      if ((result as any).error) {
        sendErrors.push((result as any).error.message || "unknown send error");
        console.error("resend error", result);
      } else {
        console.log("sent to", sub.email);
      }
    }

    if (sendErrors.length > 0) {
      return new Response(`send errors: ${sendErrors.join("; ")}`, {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response("sent", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("opportunity-email-public error", err);
    return new Response("error", { status: 500, headers: corsHeaders });
  }
});

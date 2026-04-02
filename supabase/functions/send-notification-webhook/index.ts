import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { affiliate_id, notification_title, notification_message, notification_type, lead_name, lead_id } = body;

    if (!affiliate_id) {
      return new Response(JSON.stringify({ error: "affiliate_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get affiliate profile (phone number)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, phone, email")
      .eq("id", affiliate_id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching affiliate profile:", profileError);
      return new Response(JSON.stringify({ error: "Affiliate not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get n8n webhook URL from app_settings
    const { data: settings } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["n8n_webhook_url"]);

    const n8nWebhookUrl = settings?.find((s: { key: string; value: string | null }) => s.key === "n8n_webhook_url")?.value;

    if (!n8nWebhookUrl) {
      console.log("n8n webhook URL not configured, skipping WhatsApp notification");
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "n8n_webhook_url not configured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send to n8n webhook
    const payload = {
      type: "notification",
      notification_type: notification_type || "info",
      notification_title: notification_title || "",
      notification_message: notification_message || "",
      affiliate: {
        id: affiliate_id,
        name: profile.full_name,
        phone: profile.phone,
        email: profile.email,
      },
      lead_name: lead_name || null,
      lead_id: lead_id || null,
      timestamp: new Date().toISOString(),
    };

    console.log("Sending notification to n8n webhook:", JSON.stringify(payload));

    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error(`n8n webhook error [${webhookResponse.status}]: ${errorText}`);
      return new Response(JSON.stringify({ success: false, error: "Webhook call failed" }), {
        status: 200, // Don't fail the whole operation
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Notification sent to n8n successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-notification-webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

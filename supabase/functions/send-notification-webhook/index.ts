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

    // Get active webhooks from n8n_webhooks table (type 'notification' or 'all')
    const { data: webhooks, error: webhooksError } = await supabase
      .from("n8n_webhooks")
      .select("id, name, webhook_url, webhook_type")
      .eq("is_active", true)
      .in("webhook_type", ["notification", "all"]);

    if (webhooksError) {
      console.error("Error fetching webhooks:", webhooksError);
    }

    // Fallback: check app_settings for legacy webhook
    let webhookUrls: { name: string; url: string }[] = [];
    
    if (webhooks && webhooks.length > 0) {
      webhookUrls = webhooks.map(w => ({ name: w.name, url: w.webhook_url }));
    } else {
      const { data: settings } = await supabase
        .from("app_settings")
        .select("key, value")
        .eq("key", "n8n_webhook_url")
        .single();

      if (settings?.value) {
        webhookUrls = [{ name: "Legacy", url: settings.value }];
      }
    }

    if (webhookUrls.length === 0) {
      console.log("No webhook URLs configured, skipping WhatsApp notification");
      return new Response(JSON.stringify({ success: true, skipped: true, reason: "No webhooks configured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    console.log("Sending notification to", webhookUrls.length, "webhook(s)");

    const results = await Promise.allSettled(
      webhookUrls.map(async (webhook) => {
        console.log(`Sending to webhook "${webhook.name}":`, webhook.url);
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Webhook "${webhook.name}" error [${response.status}]: ${errorText}`);
          throw new Error(`${response.status}: ${errorText}`);
        }

        console.log(`Webhook "${webhook.name}" sent successfully`);
        return { name: webhook.name, success: true };
      })
    );

    const successes = results.filter(r => r.status === "fulfilled").length;
    const failures = results.filter(r => r.status === "rejected").length;

    return new Response(JSON.stringify({ 
      success: successes > 0, 
      sent: successes, 
      failed: failures 
    }), {
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

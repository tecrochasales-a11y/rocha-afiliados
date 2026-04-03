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
    const { webhook_url, payload } = body;

    if (!webhook_url) {
      return new Response(JSON.stringify({ error: "webhook_url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Testing webhook:", webhook_url);
    console.log("Payload:", JSON.stringify(payload));

    const response = await fetch(webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload || {
        type: "test",
        test: true,
        lead_id: "test-" + Date.now(),
        created_at: new Date().toISOString(),
        name: "Lead de Teste",
        email: "teste@exemplo.com",
        phone: "11999999999",
        affiliate_name: "Afiliado Teste",
        tracking_code: "TEST123",
        accepts_whatsapp: true,
        form_responses: {
          company_type: "MEI",
          has_health_plan: "Sim",
          monthly_income: "R$ 5.000 a R$ 10.000",
        },
        timestamp: new Date().toISOString(),
      }),
    });

    const responseText = await response.text();

    return new Response(JSON.stringify({
      success: response.ok,
      status: response.status,
      response: responseText.substring(0, 500),
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error testing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

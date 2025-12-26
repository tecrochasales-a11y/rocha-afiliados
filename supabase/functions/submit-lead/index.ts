import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadFormData {
  tracking_code: string;
  affiliate_id: string;
  affiliate_name: string;
  form_responses: Record<string, unknown>;
  contact: {
    name: string;
    email: string;
    phone?: string;
  };
  accepts_whatsapp: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body: LeadFormData = await req.json();
    console.log("Received lead submission:", JSON.stringify(body, null, 2));

    const {
      tracking_code,
      affiliate_id,
      affiliate_name,
      form_responses,
      contact,
      accepts_whatsapp,
    } = body;

    // Validate required fields
    if (!tracking_code || !affiliate_id || !contact?.name || !contact?.email) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios não preenchidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract individual fields from form_responses
    const leadData = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone || null,
      affiliate_id,
      tracking_code,
      status: "pending" as const,
      source: "affiliate_link",
      accepts_whatsapp,
      company_type: form_responses.company_type as string || null,
      has_health_plan: form_responses.has_health_plan as string || null,
      monthly_income: form_responses.monthly_income as string || null,
      health_plan_investment: form_responses.health_plan_investment as string || null,
      adjustment_month: form_responses.adjustment_month as string || null,
      insurance_provider: form_responses.insurance_provider as string || null,
      covered_ages: Array.isArray(form_responses.covered_ages) 
        ? (form_responses.covered_ages as string[]).join(",") 
        : null,
      cnpj_or_region: form_responses.cnpj_or_region as string || null,
      form_responses,
    };

    // Insert lead into database
    const { data: insertedLead, error: insertError } = await supabase
      .from("leads")
      .insert(leadData)
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting lead:", insertError);
      
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({ error: "Este e-mail já foi cadastrado." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao salvar lead no banco de dados" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Lead saved successfully:", insertedLead.id);

    // Fetch CRM settings
    const { data: settings, error: settingsError } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["painel_corretor_api_key", "painel_corretor_produto_id", "painel_corretor_etiquetas"]);

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
    }

    const apiKey = settings?.find((s) => s.key === "painel_corretor_api_key")?.value;
    const produtoId = settings?.find((s) => s.key === "painel_corretor_produto_id")?.value;
    const etiquetasBase = settings?.find((s) => s.key === "painel_corretor_etiquetas")?.value || "";

    // If API key is configured, send to CRM
    if (apiKey && apiKey.length > 0) {
      console.log("Sending lead to Painel do Corretor...");

      // Build observation text with all form responses
      const observationLines = [
        `Lead gerado via link de afiliado`,
        `Afiliado: ${affiliate_name}`,
        ``,
        `--- Respostas do Formulário ---`,
      ];

      // Add each response to observation
      Object.entries(form_responses).forEach(([key, value]) => {
        if (key !== "contact_info" && key !== "confirmation" && value) {
          const displayValue = Array.isArray(value) ? value.join(", ") : String(value);
          observationLines.push(`${key}: ${displayValue}`);
        }
      });

      if (accepts_whatsapp) {
        observationLines.push(`\nAceita contato via WhatsApp: Sim`);
      }

      // Build tags array
      const baseTags = etiquetasBase.split(",").map((t: string) => t.trim()).filter(Boolean);
      const etiquetas = [
        ...baseTags,
        `afiliado:${affiliate_name.replace(/\s+/g, "_").toLowerCase()}`,
      ];

      const crmPayload = {
        Nome: `Lead #${insertedLead.id.slice(0, 8)} - ${contact.name}`,
        produtoId: produtoId || undefined,
        Etiquetas: etiquetas,
        Observacao: observationLines.join("\n"),
        Contato: {
          Nome: contact.name,
          Email: contact.email,
          Telefones: contact.phone ? [contact.phone] : [],
        },
      };

      console.log("CRM Payload:", JSON.stringify(crmPayload, null, 2));

      try {
        const crmResponse = await fetch("https://api.paineldocorretor.net/api/crm/negocios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ApiKey: apiKey,
          },
          body: JSON.stringify(crmPayload),
        });

        if (!crmResponse.ok) {
          const errorText = await crmResponse.text();
          console.error("CRM API error:", crmResponse.status, errorText);
        } else {
          console.log("Lead sent to CRM successfully");
        }
      } catch (crmError) {
        console.error("Error sending to CRM:", crmError);
        // Don't fail the whole request if CRM fails - lead is already saved
      }
    } else {
      console.log("CRM API key not configured, skipping CRM integration");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Lead enviado com sucesso",
        lead_id: insertedLead.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

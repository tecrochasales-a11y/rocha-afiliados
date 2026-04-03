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

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  token_uri: string;
}

// Function to create JWT for Google API authentication
async function createGoogleJWT(credentials: ServiceAccountCredentials): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: credentials.token_uri,
    exp: now + 3600,
    iat: now,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const pemContents = credentials.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsignedToken}.${signatureB64}`;
}

// Function to get Google access token
async function getGoogleAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const jwt = await createGoogleJWT(credentials);
  
  const response = await fetch(credentials.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Function to append row to Google Sheets
async function appendToGoogleSheets(
  accessToken: string,
  spreadsheetId: string,
  values: string[]
): Promise<void> {
  const range = "Leads!A:Z";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [values],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to append to Google Sheets: ${error}`);
  }

  console.log("Successfully appended to Google Sheets");
}

// Function to send lead to n8n webhook
async function sendToN8nWebhook(
  webhookUrl: string,
  leadData: {
    lead_id: string;
    created_at: string;
    name: string;
    email: string;
    phone: string | null;
    affiliate_name: string;
    tracking_code: string;
    accepts_whatsapp: boolean;
    form_responses: Record<string, unknown>;
  }
): Promise<void> {
  console.log("Sending lead to n8n webhook:", webhookUrl);
  
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(leadData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send to n8n webhook: ${response.status} - ${error}`);
  }

  console.log("Successfully sent lead to n8n webhook");
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
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios não preenchidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate field formats and lengths
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email) || contact.email.length > 255) {
      return new Response(
        JSON.stringify({ error: "E-mail inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (contact.name.length > 200) {
      return new Response(
        JSON.stringify({ error: "Nome muito longo" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (contact.phone && (contact.phone.replace(/\D/g, "").length < 10 || contact.phone.replace(/\D/g, "").length > 15)) {
      return new Response(
        JSON.stringify({ error: "Telefone inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (tracking_code.length > 20 || !/^[A-Za-z0-9]+$/.test(tracking_code)) {
      return new Response(
        JSON.stringify({ error: "Código de rastreamento inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate affiliate_id is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(affiliate_id)) {
      return new Response(
        JSON.stringify({ error: "ID de afiliado inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify affiliate exists with matching tracking code
    const { data: affiliateCheck, error: affiliateError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", affiliate_id)
      .eq("tracking_code", tracking_code)
      .single();

    if (affiliateError || !affiliateCheck) {
      return new Response(
        JSON.stringify({ error: "Afiliado não encontrado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit form_responses size to prevent abuse
    const formResponsesStr = JSON.stringify(form_responses || {});
    if (formResponsesStr.length > 10000) {
      return new Response(
        JSON.stringify({ error: "Dados do formulário muito grandes" }),
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

    // Fetch all integration settings
    const { data: settings, error: settingsError } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", [
        "painel_corretor_api_key", 
        "painel_corretor_produto_id", 
        "painel_corretor_etiquetas",
        "google_sheets_spreadsheet_id",
        "n8n_webhook_url"
      ]);

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
    }

    const apiKey = settings?.find((s) => s.key === "painel_corretor_api_key")?.value;
    const produtoId = settings?.find((s) => s.key === "painel_corretor_produto_id")?.value;
    const etiquetasBase = settings?.find((s) => s.key === "painel_corretor_etiquetas")?.value || "";
    const spreadsheetId = settings?.find((s) => s.key === "google_sheets_spreadsheet_id")?.value;

    // Get active webhooks from n8n_webhooks table (type 'lead' or 'all')
    const { data: webhooks } = await supabase
      .from("n8n_webhooks")
      .select("id, name, webhook_url, webhook_type")
      .eq("is_active", true)
      .in("webhook_type", ["lead", "all"]);

    // Fallback to legacy setting
    let webhookUrls: { name: string; url: string }[] = [];
    if (webhooks && webhooks.length > 0) {
      webhookUrls = webhooks.map(w => ({ name: w.name, url: w.webhook_url }));
    } else {
      const legacyUrl = settings?.find((s) => s.key === "n8n_webhook_url")?.value;
      if (legacyUrl) {
        webhookUrls = [{ name: "Legacy", url: legacyUrl }];
      }
    }

    // n8n Webhook Integration (PREFERRED - centralizes all integrations)
    if (webhookUrls.length > 0) {
      console.log(`Sending lead to ${webhookUrls.length} n8n webhook(s)...`);
      
      const leadPayload = {
        lead_id: insertedLead.id,
        created_at: insertedLead.created_at,
        name: contact.name,
        email: contact.email,
        phone: contact.phone || null,
        affiliate_name: affiliate_name,
        tracking_code: tracking_code,
        accepts_whatsapp: accepts_whatsapp,
        form_responses: form_responses,
      };

      const results = await Promise.allSettled(
        webhookUrls.map(async (webhook) => {
          console.log(`Sending to webhook "${webhook.name}":`, webhook.url);
          const response = await fetch(webhook.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(leadPayload),
          });
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`${response.status}: ${errorText}`);
          }
          console.log(`Webhook "${webhook.name}" sent successfully`);
        })
      );

      const successes = results.filter(r => r.status === "fulfilled").length;
      const failures = results.filter(r => r.status === "rejected").length;
      console.log(`Webhooks: ${successes} success, ${failures} failed`);
      
      if (failures > 0) {
        console.log("Some webhooks failed, continuing with direct integrations as fallback...");
      }
    } else {
      console.log("n8n webhook not configured, using direct integrations");

      // Google Sheets Integration (only if n8n not configured)
      const googleServiceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
      if (googleServiceAccountJson && spreadsheetId) {
        console.log("Sending lead to Google Sheets...");
        try {
          const credentials: ServiceAccountCredentials = JSON.parse(googleServiceAccountJson);
          const accessToken = await getGoogleAccessToken(credentials);
          
          // Prepare row data matching your spreadsheet columns
          const now = new Date().toISOString();
          const phoneClean = contact.phone?.replace(/\D/g, "").replace(/^55/, "") || "";
          
          const rowValues = [
            insertedLead.id, // id
            now, // created_time
            "", // ad_id
            "", // ad_name
            "", // adset_id
            "", // adset_name
            "", // campaign_id
            "", // campaign_name
            "", // form_id
            "", // form_name
            "", // is_organic
            "Lovable", // platform
            contact.name, // full_name
            contact.email, // email
            phoneClean, // phone_number
            form_responses.has_health_plan as string || "", // você_já_tem_um_plano_de_saúde?
            form_responses.company_type as string || "", // você_é_mei_ou_cnpj?
            form_responses.monthly_income as string || "", // qual_a_sua_renda_mensal?
            form_responses.health_plan_investment as string || "", // qual_valor_você_investe_em_plano_de_saúde_mensalmente?
            form_responses.adjustment_month as string || "", // qual_o_mês_de_reajuste_do_seu_plano?
            form_responses.insurance_provider as string || "", // qual__seguradora_do_seu_plano?
            Array.isArray(form_responses.covered_ages) ? (form_responses.covered_ages as string[]).join(", ") : "", // quais_as_idades_das_pessoas_cobertas
            form_responses.cnpj_or_region as string || "", // qual_o_seu_cnpj_ou_a_região
            "", // row_number (will be auto-filled)
            "", // enviado_crm
            affiliate_name, // afiliado
            tracking_code, // tracking_code
          ];

          await appendToGoogleSheets(accessToken, spreadsheetId, rowValues);
          console.log("Lead sent to Google Sheets successfully");
        } catch (sheetsError) {
          console.error("Error sending to Google Sheets:", sheetsError);
          // Don't fail the request if Google Sheets fails
        }
      } else {
        if (!googleServiceAccountJson) {
          console.log("Google Service Account not configured, skipping Sheets integration");
        }
        if (!spreadsheetId) {
          console.log("Google Sheets Spreadsheet ID not configured, skipping Sheets integration");
        }
      }

      // CRM Integration - If API key is configured, send to CRM
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

        // Build CRM payload using exact structure from n8n workflow
        const crmPayload = {
          id: insertedLead.id,
          Nome: contact.name,
          Cidade: form_responses.cnpj_or_region || "",
          Etiquetas: etiquetas,
          Observacao: observationLines.join("\n"),
          Contato: {
            Nome: contact.name,
            Email: contact.email,
            Telefones: contact.phone ? [contact.phone.replace(/\D/g, "").replace(/^55/, "")] : [],
          },
          produtoId: produtoId || undefined,
        };

        console.log("CRM Payload:", JSON.stringify(crmPayload, null, 2));

        try {
          // Use simple headers like n8n does - only ApiKey header
          const crmResponse = await fetch("https://api.paineldocorretor.net/api/crm/negocios", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ApiKey": apiKey,
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

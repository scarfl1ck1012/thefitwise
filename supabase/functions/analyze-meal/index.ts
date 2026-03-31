import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { description } = await req.json();
    if (!description) {
      return new Response(
        JSON.stringify({ error: "No description provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY not configured in Edge Secrets");
    }

    const systemInstruction = `You are a certified clinical nutritionist with a USDA food composition database. When given a food description, break it down into individual food items and provide PRECISE nutritional data.

CRITICAL: Return ONLY valid JSON, no markdown, no code blocks. Format:
{"items":[{"name":"Food name","calories":123,"protein":10,"carbs":20,"fat":5,"sodium":200,"potassium":300,"servings":1}]}

PRECISION RULES:
- Use USDA Standard Reference values. Do NOT estimate loosely.
- Calories must match: (protein × 4) + (carbs × 4) + (fat × 9) approximately
- For cooked foods, use cooked weight nutritional values
- For raw foods, use raw weight nutritional values
- Sodium is in milligrams (mg). Most whole foods are low (0-100mg). Processed foods are high (300-1000mg+)
- Potassium is in milligrams (mg). Fruits/vegetables are high (150-500mg). Meats moderate (200-400mg)
- If someone says "2 eggs and 1 toast", return 2 separate items: eggs (servings: 2) and toast (servings: 1)
- Be specific with names (e.g., "Boiled Egg (large)" not just "Egg")
- Use realistic per-serving values based on standard portion sizes
- The servings field represents how many of that item
- Always return at least one item

REFERENCE VALUES (per standard serving):
- 1 large egg: 78cal, 6g protein, 1g carbs, 5g fat, 62mg sodium, 63mg potassium
- 1 roti/chapati: 104cal, 3g protein, 18g carbs, 3g fat, 119mg sodium, 69mg potassium
- 1 bowl dal: 180cal, 12g protein, 30g carbs, 2g fat, 490mg sodium, 480mg potassium
- 1 medium banana: 105cal, 1g protein, 27g carbs, 0g fat, 1mg sodium, 422mg potassium
- 100g chicken breast: 165cal, 31g protein, 0g carbs, 3.6g fat, 74mg sodium, 256mg potassium
- 100g cooked white rice: 130cal, 3g protein, 28g carbs, 0.3g fat, 1mg sodium, 35mg potassium`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: description }] }],
          generationConfig: { temperature: 0.1 },
        }),
      },
    );

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response, handling potential markdown wrapping
    let parsed;
    try {
      const cleaned = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Manual env parsing since dotenv might not be available or acting up
const envLocal = fs.readFileSync(path.resolve(".env.local"), "utf8");
const envDict = {};
envLocal.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envDict[match[1]] = match[2].trim();
});

const supabaseUrl = envDict["VITE_SUPABASE_URL"];
const supabaseKey =
  envDict["VITE_SUPABASE_PUBLISHABLE_KEY"] || envDict["VITE_SUPABASE_ANON_KEY"];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log("1. Fetching raw profiles...");
  const { data: profiles, error: pError } = await supabase
    .from("profiles")
    .select("*");
  if (pError) console.error("Profiles error:", pError);
  else console.log(`Found ${profiles?.length || 0} profiles`);
  console.log(profiles);

  console.log("\n2. Fetching raw user_stats...");
  const { data: stats, error: sError } = await supabase
    .from("user_stats")
    .select("*");
  if (sError) console.error("Stats error:", sError);
  else console.log(`Found ${stats?.length || 0} user_stats records`);
  console.log(stats);

  console.log("\n3. Testing the join query used by CommunityPage...");
  const { data: joined, error: jError } = await supabase.from("profiles")
    .select(`
      user_id,
      full_name,
      avatar_url,
      user_stats (
          xp,
          level,
          current_streak
      )
    `);
  if (jError) console.error("Join Query error:", jError);
  else console.log(`Join query returned ${joined?.length || 0} records`);
  console.log(joined);
}

testQuery();

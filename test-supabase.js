import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Initialize Supabase from env
const envLocal = fs.readFileSync(path.resolve(".env"), "utf8");
const envDict = {};
envLocal.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envDict[match[1]] = match[2].trim().replace(/^"/, "").replace(/"$/, "");
  }
});

const url = envDict["VITE_SUPABASE_URL"];
const key =
  envDict["VITE_SUPABASE_PUBLISHABLE_KEY"] || envDict["VITE_SUPABASE_ANON_KEY"];

const supabase = createClient(url, key);

async function testClientSideFetch() {
  console.log("Testing client-side fetch without auth token first...");
  const { data: noAuthData, error: noAuthErr } = await supabase
    .from("profiles")
    .select("*");

  if (noAuthErr) {
    console.error("No Auth Fetch Error:", noAuthErr.message);
  } else {
    console.log(`No Auth Fetch Success - Found ${noAuthData.length} records!`);
  }
}

testClientSideFetch();

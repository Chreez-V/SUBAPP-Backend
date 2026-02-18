import { createClient } from "@supabase/supabase-js";
import { envs } from "../config/env.config.js";

export const supabase = createClient(
  envs.SUPABASE_URL,
  envs.SUPABASE_KEY
);

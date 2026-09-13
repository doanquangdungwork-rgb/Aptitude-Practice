import {createClient} from "@supabase/supabase-js";

const rawUrl=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
const url=rawUrl&&/^https?:\/\//i.test(rawUrl)?rawUrl:null;

export const supabase=url&&key?createClient(url,key):null;

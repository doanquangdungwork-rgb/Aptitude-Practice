import {createClient} from "@supabase/supabase-js";

const rawUrl=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
let url:string|null=null;

if(rawUrl){
  try{
    const parsed=new URL(rawUrl);
    if((parsed.protocol==="https:"||parsed.protocol==="http:")&&parsed.hostname) url=parsed.toString();
  }catch{}
}

export const supabase=url&&key?createClient(url,key):null;

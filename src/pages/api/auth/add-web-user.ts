// with `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { email, password, group } = await request.json();

  if (!email || !password) {
    return new Response("Email and password are required", { status: 400 });
  }

  const { error: userError } = await supabase.auth.signUp({email,password});

  if (userError) {
    return new Response('Adding user failed: '+userError.message, { status: 400 });
  }

  const { error: groupError } = await supabase.from('groups').insert({username: email,group: group});

  if (groupError) {
    return new Response('Group insert failed: '+groupError.message, { status: 400 });
  }

  return new Response('User added successfully', { status: 200 });
};
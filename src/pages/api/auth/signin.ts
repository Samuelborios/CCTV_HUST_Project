// Avec `output: 'static'` configuré :
// export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import { URLSearchParams } from "url";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  // Analyse les données du formulaire
  const body = await request.text();
  const params = new URLSearchParams(body);
  
  const email = params.get("email");
  const password = params.get("password");

  if (!email || !password) {
    return new Response("Email and password are required", { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  const { access_token, refresh_token } = data.session;
  cookies.set("sb-access-token", access_token, {
    path: "/",
  });
  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
  });
  return redirect("/dashboard");
};

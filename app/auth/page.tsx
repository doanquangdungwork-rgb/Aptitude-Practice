"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type AuthUser = {
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
};

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!supabase) {
      setMsg("Supabase is not connected. Add the project URL and publishable key in Vercel.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error_description") || params.get("error");

    if (oauthError) {
      setMsg(decodeURIComponent(oauthError.replace(/\+/g, " ")));
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setMsg(error.message);
        return;
      }
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function google() {
    setMsg("");

    if (!supabase) {
      setMsg("Supabase is not connected. Add the project URL and publishable key in Vercel.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      setMsg(error.message);
      setLoading(false);
    }
  }

  async function signOut() {
    if (!supabase) return;

    setLoading(true);
    const { error } = await supabase.auth.signOut();

    if (error) setMsg(error.message);

    setUser(null);
    setLoading(false);
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Aptitude learner";

  const avatar =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
      <div className="grid overflow-hidden rounded-[2.5rem] border border-[#e8e5df] bg-white/80 shadow-[0_24px_70px_rgba(70,65,90,.08)] md:grid-cols-2">
        <div className="pastel-lavender p-8 md:p-12">
          <div className="inline-flex rounded-full bg-white/65 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-[#6f6a8f]">
            Personal learning center
          </div>

          <h1 className="mt-8 text-4xl font-black tracking-[-.045em] md:text-5xl">
            One account.
            <br />
            Your progress stays yours.
          </h1>

          <p className="mt-5 max-w-md leading-7 text-[#686d78]">
            Sign in with Google to keep your attempts, bookmarks, wrong questions and learning history tied to your account.
          </p>

          <div className="mt-10 grid gap-3">
            <div className="rounded-2xl bg-white/60 p-4 text-sm font-semibold">✓ Resume unfinished tests</div>
            <div className="rounded-2xl bg-white/60 p-4 text-sm font-semibold">✓ Track accuracy over time</div>
            <div className="rounded-2xl bg-white/60 p-4 text-sm font-semibold">✓ Save questions for later</div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="text-sm font-bold text-[#858b94]">Welcome to aptitude.</div>

          {user ? (
            <>
              <div className="mt-6 flex items-center gap-4">
                {avatar ? (
                  <img src={avatar} alt="" className="h-14 w-14 rounded-full object-cover ring-4 ring-[#e9e4f7]" />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-[#e9e4f7] text-xl font-black text-[#6f6a8f]">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-black tracking-[-.025em]">Hi, {displayName}</h2>
                  {user.email && <p className="mt-1 truncate text-sm text-[#858b94]">{user.email}</p>}
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-[#e2f1ea] p-4 text-sm font-semibold text-[#526b5e]">
                ✓ Your account is connected and your Supabase session is active.
              </div>

              <button onClick={signOut} disabled={loading} className="mt-6 w-full rounded-2xl border border-[#ddd8e4] bg-white px-5 py-3.5 font-bold text-[#4f5360] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60">
                {loading ? "Signing out…" : "Sign out"}
              </button>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-3xl font-black tracking-[-.03em]">Continue with Google</h2>

              <p className="mt-3 leading-6 text-[#707984]">
                No passwords to remember. Use your Google account and get straight into practice.
              </p>

              <button disabled={loading} onClick={google} className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-[#ddd8e4] bg-white px-5 py-3.5 font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f4e2e9] text-sm font-black">G</span>
                {loading ? "Opening Google…" : "Continue with Google"}
              </button>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#e8e5df]" />
                <span className="text-xs text-[#a0a5ac]">SECURE LOGIN</span>
                <div className="h-px flex-1 bg-[#e8e5df]" />
              </div>

              <p className="mt-6 text-xs leading-5 text-[#9298a0]">
                Your Google account is used only to authenticate your Aptitude account. Your password is never shared with this app.
              </p>
            </>
          )}

          {msg && <div className="mt-5 rounded-2xl bg-[#f8e5dc] p-4 text-sm leading-5 text-[#7d5d50]">{msg}</div>}

          <p className="mt-8 text-xs leading-5 text-[#9298a0]">
            Google sign-in requires Google to be enabled under Supabase Authentication → Providers and this app URL to be included in the Supabase redirect configuration.
          </p>
        </div>
      </div>
    </div>
  );
}

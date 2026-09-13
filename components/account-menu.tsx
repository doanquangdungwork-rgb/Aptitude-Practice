"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function AccountMenu() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const close = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);

    return () => {
      listener.subscription.unsubscribe();
      document.removeEventListener("mousedown", close);
    };
  }, []);

  if (!user) {
    return (
      <Link
        href="/auth"
        className="rounded-full bg-[#6f6a8f] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        Sign in
      </Link>
    );
  }

  const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Account";
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-[#e8e5df] bg-white px-2 py-1.5 text-sm font-bold text-[#3f4650] shadow-sm transition hover:shadow-md"
      >
        {avatar ? (
          <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9e4f7] text-xs font-black text-[#6f6a8f]">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="max-w-24 truncate px-1">{name.split(" ")[0]}</span>
        <span className="px-1 text-[#858b94]">⌄</span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-[#e8e5df] bg-white p-2 shadow-[0_18px_50px_rgba(40,40,50,.14)]">
          <div className="border-b border-[#eeeae4] px-3 py-3">
            <div className="text-sm font-bold text-[#303740]">{name}</div>
            <div className="mt-1 truncate text-xs text-[#8a9098]">{user.email}</div>
          </div>
          <Link href="/history" onClick={() => setOpen(false)} className="mt-1 block rounded-xl px-3 py-2.5 text-sm font-semibold text-[#59616c] hover:bg-[#f7f5f1]">
            Learning Center
          </Link>
          <Link href="/bookmarks" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-[#59616c] hover:bg-[#f7f5f1]">
            Bookmarks
          </Link>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await supabase?.auth.signOut();
            }}
            className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold text-[#8b5c64] hover:bg-[#f8e5e5]"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { appCatalog } from "../../lib/data";
import { getAttempts, getBookmarks, getWrongQuestions } from "../../lib/progress";

export default function History(){
 const [attempts,setAttempts]=useState<any[]>([]); const [bookmarkCount,setBookmarkCount]=useState(0); const [wrongCount,setWrongCount]=useState(0);
 useEffect(()=>{setAttempts(getAttempts().filter(x=>x.completedAt));setBookmarkCount(getBookmarks().length);setWrongCount(getWrongQuestions().length)},[]);
 const completed=attempts.length;
 return <div className="mx-auto max-w-7xl px-6 py-12 md:py-16"><p className="text-xs font-black uppercase tracking-[.2em] text-[#8a9098]">Learning Center</p><h1 className="mt-2 text-4xl font-black">Your learning</h1>
 <div className="mt-9 grid gap-4 md:grid-cols-4">{[[completed,"Tests completed"],[bookmarkCount,"Bookmarks"],[wrongCount,"Wrong questions"],[attempts.length?"Active":"Ready","Learning status"]].map(x=><div key={x[1]} className="soft-card rounded-3xl p-6"><div className="text-3xl font-black">{x[0]}</div><div className="mt-2 text-sm text-[#737982]">{x[1]}</div></div>)}</div>
 <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]"><section className="soft-card rounded-[2rem] p-7"><h2 className="text-xl font-black">Recent tests</h2>{attempts.length?<div className="mt-5 divide-y divide-[#eeeae4]">{attempts.slice(0,10).map(a=><div key={a.id} className="flex items-center justify-between gap-4 py-4"><div><div className="font-bold">{appCatalog.tests.find((t:any)=>t.test_id===a.testId)?.title?.replaceAll("_"," ")||a.testId}</div><div className="mt-1 text-xs text-[#8a9098]">{new Date(a.completedAt).toLocaleString()}</div></div><span className="text-xs font-bold text-[#6f6a8f]">Completed</span></div>)}</div>:<p className="mt-3 text-sm leading-6 text-[#737982]">No completed tests yet. Start a test and your progress will be saved automatically.</p>}</section>
 <section className="pastel-lavender rounded-[2rem] p-7"><h2 className="text-xl font-black">Keep improving</h2><p className="mt-3 text-sm leading-6 text-[#696f79]">Saved and wrong questions stay available for review on this device.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/bookmarks" className="rounded-full bg-white px-4 py-2 text-sm font-bold">Bookmarks →</Link><Link href="/tests" className="rounded-full bg-[#6f6a8f] px-4 py-2 text-sm font-bold text-white">Practice →</Link></div></section></div></div>
}
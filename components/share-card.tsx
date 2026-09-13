"use client";
import {useEffect,useRef,useState} from "react";
import {appCatalog,questionsForTest} from "../lib/data";
import {getAttempts,getPracticeDays} from "../lib/progress";
import {supabase} from "../lib/supabase";

type Kind="profile"|"dashboard"|"result";
type Props={kind:Kind;result?:{title:string;correct:number;total:number;accuracy:number;duration:string}};
const pad=(n:number)=>String(n).padStart(2,"0");
const dayKey=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const calcStreak=(days:string[])=>{const s=new Set(days);const d=new Date();d.setHours(0,0,0,0);if(!s.has(dayKey(d)))d.setDate(d.getDate()-1);let n=0;while(s.has(dayKey(d))){n++;d.setDate(d.getDate()-1)}return n};
const roundRect=(x:CanvasRenderingContext2D,x0:number,y:number,w:number,h:number,r:number)=>{x.beginPath();x.roundRect(x0,y,w,h,r);};

export default function ShareCard({kind,result}:Props){
 const [open,setOpen]=useState(false),[format,setFormat]=useState<"wide"|"story">("wide");
 const canvas=useRef<HTMLCanvasElement>(null);
 const [stats,setStats]=useState({streak:0,completed:0,days:0,accuracy:0,monthDays:[] as string[]});
 useEffect(()=>{if(!open)return;(async()=>{const session=await supabase?.auth.getSession();const uid=session?.data.session?.user?.id||"";const attempts=getAttempts().filter(a=>a.completedAt);let answered=0,correct=0;attempts.forEach(a=>questionsForTest(a.testId).forEach((q:any)=>{if(a.answers?.[q.id]){answered++;if(String(a.answers[q.id]).trim().toLowerCase()===String(q.a??"").trim().toLowerCase())correct++;}}));const days=uid?getPracticeDays(uid):[];const now=new Date();const key=`${now.getFullYear()}-${pad(now.getMonth()+1)}`;setStats({streak:uid?calcStreak(days):0,completed:attempts.length,days:uid?days.length:0,accuracy:answered?Math.round(correct/answered*100):0,monthDays:days.filter(d=>d.startsWith(key))})})()},[open,kind]);
 useEffect(()=>{const c=canvas.current;if(!c||!open)return;const wide=format==="wide",w=wide?1200:1920,h=wide?630:1080,s=wide?1:1.5,l=wide?72:110; c.width=w;c.height=h;const x=c.getContext("2d")!;
 const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,"#ddd0ed");g.addColorStop(.38,"#dbeaf0");g.addColorStop(.72,"#f0dce5");g.addColorStop(1,"#f8eee7");x.fillStyle=g;x.fillRect(0,0,w,h);
 const glow=x.createRadialGradient(w*.82,h*.12,5,w*.82,h*.12,w*.5);glow.addColorStop(0,"rgba(255,255,255,.9)");glow.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=glow;x.fillRect(0,0,w,h);
 x.fillStyle="#302d36";x.font=`800 ${34*s}px Arial`;x.fillText("aptitude.",l,78*s);x.fillStyle="#77717f";x.font=`700 ${17*s}px Arial`;x.fillText(kind==="profile"?"A QUIET PLACE TO PRACTICE":kind==="dashboard"?"MY PRACTICE JOURNEY":"TEST RESULT",l,122*s);
 if(kind==="profile"){
  x.fillStyle="#302d36";x.font=`900 ${58*s}px Arial`;x.fillText("Practice with clarity.",l,245*s);x.fillStyle="#77717f";x.font=`500 ${27*s}px Arial`;x.fillText("Solve · review · progress · repeat",l,292*s);
  const cy=wide?370:610,cw=wide?300:470,ch=wide?105:155;["30 curated tests","755 questions","6 reasoning pillars"].forEach((t,i)=>{const xx=l+i*(cw+20*s);roundRect(x,xx,cy,cw,ch,22*s);x.fillStyle="rgba(255,255,255,.62)";x.fill();x.fillStyle="#4c4653";x.font=`800 ${20*s}px Arial`;x.fillText(t,xx+24*s,cy+62*s)});
 } else if(kind==="dashboard"){
  const top=wide?195:300;x.fillStyle="#302d36";x.font=`900 ${76*s}px Arial`;x.fillText(String(stats.streak),l,top+60*s);x.fillStyle="#77717f";x.font=`700 ${24*s}px Arial`;x.fillText("DAY STREAK",l+155*s,top+60*s);
  const barY=top+95*s;roundRect(x,l,barY,wide?500:760,wide?18:27,12*s);const bg=x.createLinearGradient(l,barY,l+(wide?500:760),barY);bg.addColorStop(0,"#9b83b5");bg.addColorStop(1,"#d68ea7");x.fillStyle="rgba(255,255,255,.55)";x.fill();x.fillStyle=bg;x.fillRect(l,barY,(wide?500:760)*Math.min(stats.completed/appCatalog.tests.length,1),wide?18:27);
  x.fillStyle="#5e5865";x.font=`700 ${17*s}px Arial`;x.fillText(`${stats.completed}/${appCatalog.tests.length} tests completed`,l,barY+42*s);
  const gridY=wide?345:560; x.fillStyle="#4c4653";x.font=`800 ${17*s}px Arial`;x.fillText("STREAK TABLE · LAST 30 DAYS",l,gridY-20*s);
  const cols=15,cell=wide?24:38,gap=wide?8:13;for(let i=0;i<30;i++){const d=new Date();d.setDate(d.getDate()-(29-i));const active=stats.monthDays.includes(dayKey(d));const xx=l+(i%cols)*(cell+gap),yy=gridY+Math.floor(i/cols)*(cell+gap);x.beginPath();x.arc(xx+cell/2,yy+cell/2,cell/2,0,Math.PI*2);x.fillStyle=active?"#9a7faf":"rgba(255,255,255,.58)";x.fill();}
  x.fillStyle="#77717f";x.font=`600 ${14*s}px Arial`;x.fillText(`${stats.days} total practice days`,l,wide?535:900);
 } else if(kind==="result"&&result){
  const y=wide?205:330;x.fillStyle="#302d36";x.font=`900 ${44*s}px Arial`;x.fillText(result.title.slice(0,30),l,y);
  x.fillStyle="#6d6388";x.font=`900 ${88*s}px Arial`;x.fillText(`${result.accuracy}%`,l,y+105*s);
  x.fillStyle="#77717f";x.font=`700 ${22*s}px Arial`;x.fillText(`${result.correct}/${result.total} correct`,l+270*s,y+92*s);x.fillText(`${result.duration} spent`,l+270*s,y+128*s);
  const bx=l,by=y+170*s,bw=wide?500:760,bh=wide?18:28;roundRect(x,bx,by,bw,bh,12*s);x.fillStyle="rgba(255,255,255,.58)";x.fill();const rg=x.createLinearGradient(bx,by,bx+bw,by);rg.addColorStop(0,"#8d79a8");rg.addColorStop(1,"#d28ca4");x.fillStyle=rg;roundRect(x,bx,by,bw*result.accuracy/100,bh,12*s);x.fill();
  const yy=by+65*s,items=[[result.correct,"CORRECT"],[result.total-result.correct,"WRONG / SKIPPED"],[result.duration,"TIME SPENT"]];items.forEach((it,i)=>{const xx=l+i*(wide?220:330)*s;roundRect(x,xx,yy,wide?190:290,wide?105:150,18*s);x.fillStyle="rgba(255,255,255,.58)";x.fill();x.fillStyle="#403b45";x.font=`800 ${wide?24:36}px Arial`;x.fillText(String(it[0]),xx+18*s,yy+43*s);x.fillStyle="#77717f";x.font=`700 ${wide?12:18}px Arial`;x.fillText(String(it[1]),xx+18*s,yy+72*s)});
  x.fillStyle="#77717f";x.font=`600 ${16*s}px Arial`;x.fillText("One result. One more step forward.",l,wide?560:950);
 }
 x.fillStyle="#77717f";x.font=`600 ${14*s}px Arial`;x.fillText("aptitude · practice with intention",w-(wide?300:450)*s,h-(wide?35:55)*s);
 },[open,format,kind,result,stats]);
 const save=()=>{const c=canvas.current;if(!c)return;const a=document.createElement("a");a.download=`aptitude-${kind}-${format}.png`;a.href=c.toDataURL("image/png");a.click()};
 const share=async()=>{const url=window.location.href;try{if(navigator.share){await navigator.share({title:"aptitude.",text:kind==="result"?`I scored ${result?.accuracy}% on an aptitude practice test.`:"My aptitude practice progress",url});return}}catch{}try{await navigator.clipboard.writeText(url);alert("Link copied!")}catch{alert(url)}};
 return <><button onClick={()=>setOpen(true)} className="rounded-full border border-[#ddd8e4] bg-white/80 px-5 py-2.5 text-sm font-bold text-[#5f597b] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">↗ Share</button>{open&&<div className="fixed inset-0 z-[100] grid place-items-center bg-[#302d36]/35 p-4 backdrop-blur-sm"><div className="w-full max-w-4xl rounded-[2rem] border border-white/70 bg-[#fbfaf9] p-5 shadow-[0_30px_100px_rgba(40,35,50,.2)] md:p-7"><div className="flex items-center justify-between"><div><p className="eyebrow">Share</p><h2 className="mt-2 text-2xl font-black">Choose your format</h2></div><button onClick={()=>setOpen(false)} className="rounded-full bg-white px-3 py-2 font-bold">✕</button></div><div className="mt-5 flex gap-2"><button onClick={()=>setFormat("wide")} className={`rounded-full px-4 py-2 text-sm font-bold ${format==="wide"?"bg-[#6d6388] text-white":"bg-white text-[#66616b]"}`}>Website · 1200×630</button><button onClick={()=>setFormat("story")} className={`rounded-full px-4 py-2 text-sm font-bold ${format==="story"?"bg-[#6d6388] text-white":"bg-white text-[#66616b]"}`}>16:9 · 1920×1080</button></div><div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[#e8e2e7] bg-white"><canvas ref={canvas} className="block h-auto w-full"/></div><div className="mt-5 flex justify-end gap-2"><button onClick={save} className="rounded-full bg-[#6d6388] px-5 py-2.5 text-sm font-bold text-white">↓ Save image</button><button onClick={share} className="rounded-full border border-[#ddd8e4] bg-white px-5 py-2.5 text-sm font-bold">Share / copy link</button></div></div></div>}</>;
}

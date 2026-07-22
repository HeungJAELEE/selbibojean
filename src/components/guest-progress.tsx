"use client";
import { useSyncExternalStore } from "react";
import { CheckCircle2, Clock3, Target, XCircle } from "lucide-react";

type Attempt = { questionId:string; isCorrect:boolean; dueAt:string; attemptedAt:string; attemptKind?:string };
function subscribe(callback:()=>void){window.addEventListener('storage',callback);return()=>window.removeEventListener('storage',callback)}
export function GuestProgress(){const raw=useSyncExternalStore(subscribe,()=>localStorage.getItem('seolbi:guest-attempts')??'[]',()=> '[]'); const attempts=JSON.parse(raw) as Attempt[]; const unique=new Set(attempts.map(a=>a.questionId)).size; const correct=attempts.filter(a=>a.isCorrect).length; const wrong=attempts.length-correct; const due=attempts.filter(a=>new Date(a.dueAt)<=new Date()).length; return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<Target/>} value={unique} label="학습한 문제"/><Metric icon={<CheckCircle2/>} value={correct} label="정답 시도"/><Metric icon={<XCircle/>} value={wrong} label="오답 시도"/><Metric icon={<Clock3/>} value={due} label="복습 예정"/></div>}
function Metric({icon,value,label}:{icon:React.ReactNode;value:number;label:string}){return <div className="card p-6"><span className="text-[#16697a]">{icon}</span><p className="mt-5 text-3xl font-black">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>}

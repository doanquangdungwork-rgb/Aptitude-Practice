import Link from "next/link";
import ProgressDashboard from "../../components/progress-dashboard";

export default function Dashboard(){
 return <div className="mx-auto max-w-7xl px-6 py-10 md:py-14"><div className="mb-7 flex items-center justify-between gap-4"><Link href="/" className="text-sm font-bold text-[#737982]">← Home</Link><Link href="/tests" className="rounded-full bg-[#69628a] px-5 py-2.5 text-sm font-bold text-white">Practice</Link></div><ProgressDashboard/></div>;
}

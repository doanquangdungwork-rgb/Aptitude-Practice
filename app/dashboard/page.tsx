import Link from "next/link";
import ProgressDashboard from "../../components/progress-dashboard";
import ShareCard from "../../components/share-card";
export default function Dashboard(){return <div className="app-page"><div className="section-head"><div><p className="eyebrow">Progress</p><h1 className="section-title">Small practice, bigger progress.</h1><p className="mt-3 max-w-xl text-sm leading-7 text-[#99968f]">Everything you have practiced, where you are strongest, and what is worth doing next.</p></div><div className="flex flex-wrap gap-3"><ShareCard kind="dashboard"/><Link href="/tests" className="yellow-button">Practice →</Link></div></div><ProgressDashboard/></div>}

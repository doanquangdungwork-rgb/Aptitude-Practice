import "./globals.css";
import Link from "next/link";
import AccountMenu from "../components/account-menu";
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><header className="site-header"><div className="nav-shell"><Link href="/" className="brand">Aptitude Lab</Link><nav className="main-nav"><Link href="/tests">Practice</Link><Link href="/dashboard">Progress</Link></nav><nav className="mobile-nav"><Link href="/tests">Practice</Link><Link href="/dashboard">Progress</Link></nav><AccountMenu /></div></header><main>{children}</main></body></html>}

import Link from "next/link"
import Image from "next/image"
import { headers } from "next/headers"
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/better_auth/auth";
const layout = async ({ children }: { children: React.ReactNode }) => {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) {
        redirect('/')
    }
    return (
        <main className="auth-layout bg-[radial-gradient(circle_at_top_left,rgba(253,212,88,0.14),transparent_28%),linear-gradient(180deg,#050505_0%,#0a0a0a_100%)]">
            <section className="auth-left-section scrollbar-hide-default">
                <Link href="/" className="auth-logo inline-flex shrink-0">
                    <span className="relative block h-16 w-64 overflow-hidden rounded-xl">
                        <Image src="/assets/images/logo.png" alt="NovaStocks" fill priority sizes="256px" className="object-cover object-center" />
                    </span>
                </Link>
                <div className="pb-6 lg:pb-8 flex-1">{children}</div>
            </section>
            <section className="auth-right-section bg-[linear-gradient(180deg,rgba(20,20,20,0.92),rgba(33,35,40,0.94))]">
                <div className="z-10 relative lg:mt-4 lg:mb-16 max-w-2xl">
                    <blockquote className="auth-blockquote">
                        NovaStocks turned my watchlist into a winning list. The alerts are spot-on, and I feel more confident making moves in the market
                    </blockquote>
                    <div className="flex items-center justify-between">
                        <div>
                            <cite className="auth-testimonial-author">- Ethan R.</cite>
                            <p className="max-md:text-xs text-gray-500">Retail Investor</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) =>
                                <Image key={star} src="/assets/icons/star.svg" alt="Star" width={20} height={20} className="w-5 h-5" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex-1 relative mt-8 lg:mt-0">
                    <Image src="/assets/images/dashboard-preview.png" alt="Dashboard Preview" width={1500} height={1200} className="auth-dashboard-preview absolute top-0" />
                </div>
            </section>
        </main>
    )
}

export default layout
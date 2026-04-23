import WatchlistPageClient from "@/components/WatchlistPageClient";
import { getMyWatchlist } from "@/lib/actions/watchlist.actions";

type EnrichedWatchlistItem = {
    symbol: string;
    company: string;
    addedAt: Date;
    currentPrice?: number;
    changePercent?: number;
    exchange?: string;
    type?: string;
    marketCap?: number;
    companyLogo?: string;
};

type FinnhubProfile = ProfileData & {
    exchange?: string;
    assetType?: string;
    logo?: string;
    marketCapitalization?: number;
    name?: string;
};

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

const toNumber = (value: unknown): number | undefined => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const enrichWatchlistItems = async (
    items: Awaited<ReturnType<typeof getMyWatchlist>>
): Promise<EnrichedWatchlistItem[]> => {
    const token = process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
        return items;
    }

    return Promise.all(
        items.map(async (item) => {
            try {
                const symbol = item.symbol.trim().toUpperCase();

                const [quoteRes, profileRes] = await Promise.all([
                    fetch(`${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`, {
                        cache: "no-store",
                    }),
                    fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${token}`, {
                        cache: "force-cache",
                        next: { revalidate: 3600 },
                    }),
                ]);

                const quote = quoteRes.ok ? ((await quoteRes.json()) as QuoteData) : null;
                const profile = profileRes.ok ? ((await profileRes.json()) as FinnhubProfile) : null;

                return {
                    ...item,
                    company: profile?.name || item.company,
                    currentPrice: toNumber(quote?.c),
                    changePercent: toNumber(quote?.dp),
                    exchange: profile?.exchange,
                    type: profile?.assetType || "Stock",
                    marketCap: toNumber(profile?.marketCapitalization),
                    companyLogo: profile?.logo,
                } satisfies EnrichedWatchlistItem;
            } catch {
                return item;
            }
        })
    );
};

const WatchlistPage = async () => {
    const watchlistItems = await getMyWatchlist();
    const enrichedItems = await enrichWatchlistItems(watchlistItems);

    return <WatchlistPageClient initialItems={enrichedItems} />;
};

export default WatchlistPage;

"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { removeFromMyWatchlist } from "@/lib/actions/watchlist.actions";

type WatchlistItem = {
    symbol: string;
    company: string;
    addedAt: Date | string;
    currentPrice?: number;
    changePercent?: number;
    exchange?: string;
    type?: string;
    marketCap?: number;
    companyLogo?: string;
};

const formatMarketCap = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return "Mkt Cap N/A";
    }

    if (value >= 1000) {
        return `Mkt Cap ${(value / 1000).toFixed(2)}T`;
    }

    return `Mkt Cap ${value.toFixed(1)}B`;
};

const formatAddedDate = (value: Date | string) => {
    const date = new Date(value);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
};

const WatchlistPageClient = ({ initialItems }: { initialItems: WatchlistItem[] }) => {
    const [items, setItems] = useState<WatchlistItem[]>(initialItems);
    const [pendingSymbol, setPendingSymbol] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const sortedItems = useMemo(
        () =>
            [...items].sort(
                (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
            ),
        [items]
    );

    const handleRemove = (symbol: string) => {
        const previous = items;
        setPendingSymbol(symbol);
        setItems((curr) => curr.filter((item) => item.symbol !== symbol));

        startTransition(async () => {
            const result = await removeFromMyWatchlist(symbol);
            setPendingSymbol(null);

            if (!result.success) {
                setItems(previous);
                toast.error(result.error || "Failed to remove from watchlist");
            }
        });
    };

    if (sortedItems.length === 0) {
        return (
            <div className="watchlist-empty-container flex">
                <div className="watchlist-empty">
                    <h2 className="empty-title">Your Watchlist Is Empty</h2>
                    <p className="empty-description">
                        Add stocks from search or any stock details page, then manage them here.
                    </p>
                    <Link href="/" className="yellow-btn inline-flex items-center justify-center px-6">
                        Explore Stocks
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="watchlist space-y-6">
            <h1 className="watchlist-title">My Watchlist</h1>
            <div className="watchlist-table p-2">
                <ul className="divide-y divide-gray-600">
                    {sortedItems.map((item) => (
                        <li key={item.symbol} className="watchlist-row">
                            <div className="watchlist-left">
                                <div className="watchlist-logo-wrap">
                                    {item.companyLogo ? (
                                        <Image
                                            src={item.companyLogo}
                                            alt={`${item.company} logo`}
                                            className="watchlist-logo"
                                            width={48}
                                            height={48}
                                        />
                                    ) : (
                                        <div className="watchlist-logo-fallback">
                                            {item.symbol.slice(0, 1)}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Link href={`/stocks/${item.symbol}`} className="text-gray-100 hover:text-yellow-500 transition-colors font-semibold text-lg">
                                            {item.symbol}
                                        </Link>
                                        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                                            {item.exchange || "N/A"}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                                            {item.type || "Stock"}
                                        </span>
                                    </div>

                                    <p className="text-gray-400 text-sm truncate">{item.company}</p>

                                    <div className="flex items-center gap-4 flex-wrap text-sm">
                                        <span className="text-gray-200 font-medium">
                                            {typeof item.currentPrice === "number"
                                                ? `$${item.currentPrice.toFixed(2)}`
                                                : "Price N/A"}
                                        </span>
                                        <span className={`${typeof item.changePercent === "number" && item.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                                            {typeof item.changePercent === "number"
                                                ? `${item.changePercent >= 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`
                                                : "Change N/A"}
                                        </span>
                                        <span className="text-gray-400">
                                            {formatMarketCap(item.marketCap)}
                                        </span>
                                    </div>

                                    <p className="text-gray-500 text-xs">
                                        Added {formatAddedDate(item.addedAt)}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="watchlist-remove-btn"
                                disabled={isPending && pendingSymbol === item.symbol}
                                onClick={() => handleRemove(item.symbol)}
                            >
                                {isPending && pendingSymbol === item.symbol ? "Removing..." : "Remove"}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default WatchlistPageClient;

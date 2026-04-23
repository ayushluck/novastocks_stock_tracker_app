"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";
type SearchCommandProps = {
    renderAs?: "button" | "text";
    label?: string;
    initialStocks?: StockWithWatchlistStatus[];
};

const searchStocks = async (query: string): Promise<StockWithWatchlistStatus[]> => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!apiKey) {
        return [];
    }

    const response = await fetch(
        `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${apiKey}`
    );

    if (!response.ok) {
        throw new Error("Failed to search stocks");
    }

    const data = (await response.json()) as FinnhubSearchResponse;
    const normalized = (data.result || [])
        .filter((stock) => Boolean(stock.symbol) && Boolean(stock.description))
        .slice(0, 20)
        .map((stock) => ({
            symbol: stock.symbol,
            name: stock.description,
            exchange: "N/A",
            type: stock.type || "Common Stock",
            isInWatchlist: false,
        }));

    const seen = new Set<string>();
    return normalized.filter((stock) => {
        if (seen.has(stock.symbol)) {
            return false;
        }
        seen.add(stock.symbol);
        return true;
    });
};

export default function SearchCommand({ renderAs = "button", label = "Add stock", initialStocks = [] }: SearchCommandProps) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);

    const isSearchMode = !!searchTerm.trim();
    const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                setOpen(v => !v)
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [])

    useEffect(() => {
        if (!open) {
            return;
        }

        const trimmed = searchTerm.trim();
        if (!trimmed) {
            setStocks(initialStocks);
            setLoading(false);
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            setLoading(true);
            try {
                const results = await searchStocks(trimmed);
                setStocks(results);
            } catch {
                setStocks([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [searchTerm, open, initialStocks]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        window.addEventListener("keydown", onEscape);
        return () => window.removeEventListener("keydown", onEscape);
    }, [open]);

    const handleSelectStock = () => {
        setOpen(false);
        setSearchTerm("");
        setStocks(initialStocks);
    }

    return (
        <>
            {renderAs === 'text' ? (
                <span onClick={() => setOpen(true)} className="search-text">
                    {label}
                </span>
            ) : (
                <Button onClick={() => setOpen(true)} className="search-btn">
                    {label}
                </Button>
            )}
            {open && (
                <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
                    <div
                        className="search-dialog rounded-xl border p-0 w-[92vw] max-w-3xl"
                        role="dialog"
                        aria-modal="true"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="search-field rounded-t-xl">
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search stocks..."
                                className="search-input w-full"
                            />
                            {loading && <Loader2 className="search-loader" />}
                        </div>
                        <div className="search-list overflow-y-auto rounded-b-xl">
                            {loading ? (
                                <div className="search-list-empty">Loading stocks...</div>
                            ) : displayStocks?.length === 0 ? (
                                <div className="search-list-indicator">
                                    {isSearchMode ? 'No results found' : 'No stocks available'}
                                </div>
                            ) : (
                                <ul>
                                    <div className="search-count">
                                        {isSearchMode ? 'Search results' : 'Popular stocks'}
                                        {` `}({displayStocks?.length || 0})
                                    </div>
                                    {displayStocks?.map((stock) => (
                                        <li key={stock.symbol} className="search-item">
                                            <Link
                                                href={`/stocks/${stock.symbol}`}
                                                onClick={handleSelectStock}
                                                className="search-item-link"
                                            >
                                                <TrendingUp className="h-4 w-4 text-gray-500" />
                                                <div className="flex-1">
                                                    <div className="search-item-name">
                                                        {stock.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {stock.symbol} | {stock.exchange} | {stock.type}
                                                    </div>
                                                </div>
                                                {/*<Star />*/}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )
                            }
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
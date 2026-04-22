'use server';

import { formatArticle, getDateRange, validateArticle } from '@/lib/utils';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

type CompanyNewsResult = RawNewsArticle[];
type GeneralNewsResult = RawNewsArticle[];

type NewsCandidate = {
    article: RawNewsArticle;
    symbol: string;
};

const getApiKey = () => {
    if (!NEXT_PUBLIC_FINNHUB_API_KEY) {
        throw new Error('NEXT_PUBLIC_FINNHUB_API_KEY is not set');
    }

    return NEXT_PUBLIC_FINNHUB_API_KEY;
};

export async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
    const response = await fetch(url, {
        cache: revalidateSeconds ? 'force-cache' : 'no-store',
        ...(revalidateSeconds ? { next: { revalidate: revalidateSeconds } } : {}),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
}

const sanitizeSymbols = (symbols?: string[]) => {
    if (!symbols?.length) {
        return [] as string[];
    }

    return Array.from(
        new Set(
            symbols
                .map((symbol) => symbol.trim().toUpperCase())
                .filter((symbol) => Boolean(symbol))
        )
    );
};

const sortByDateDesc = (left: RawNewsArticle, right: RawNewsArticle) => (right.datetime ?? 0) - (left.datetime ?? 0);

const buildCompanyNewsUrl = (symbol: string, from: string, to: string) =>
    `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${getApiKey()}`;

const buildGeneralNewsUrl = () => `${FINNHUB_BASE_URL}/news?category=general&token=${getApiKey()}`;

const dedupeGeneralNews = (articles: RawNewsArticle[]) => {
    const seen = new Set<string>();

    return articles.filter((article) => {
        const headline = article.headline?.trim() || '';
        const dedupeKey = article.url?.trim() || headline || String(article.id);

        if (!headline || !validateArticle(article) || seen.has(dedupeKey)) {
            return false;
        }

        seen.add(dedupeKey);
        return true;
    });
};

const formatCompanyNewsArticles = (articlesBySymbol: Array<{ symbol: string; articles: RawNewsArticle[] }>) => {
    const selectedArticles: NewsCandidate[] = [];

    for (let round = 0; round < 6; round += 1) {
        let addedInRound = false;

        for (const { symbol, articles } of articlesBySymbol) {
            if (selectedArticles.length >= 6) {
                break;
            }

            const candidate = articles[round];
            if (!candidate || !validateArticle(candidate)) {
                continue;
            }

            selectedArticles.push({ article: candidate, symbol });
            addedInRound = true;
        }

        if (!addedInRound) {
            break;
        }
    }

    return selectedArticles
        .sort((left, right) => sortByDateDesc(left.article, right.article))
        .slice(0, 6)
        .map(({ article, symbol }, index) => formatArticle(article, true, symbol, index));
};

export const getNews = async (symbols?: string[]): Promise<MarketNewsArticle[]> => {
    try {
        const cleanedSymbols = sanitizeSymbols(symbols);
        const { from, to } = getDateRange(5);

        if (cleanedSymbols.length > 0) {
            const articlesBySymbol = await Promise.all(
                cleanedSymbols.map(async (symbol) => {
                    const articles = await fetchJSON<CompanyNewsResult>(buildCompanyNewsUrl(symbol, from, to), 300);
                    return {
                        symbol,
                        articles: articles.filter(validateArticle).sort(sortByDateDesc),
                    };
                })
            );

            return formatCompanyNewsArticles(articlesBySymbol);
        }

        const generalNews = await fetchJSON<GeneralNewsResult>(buildGeneralNewsUrl(), 900);
        const deduped = dedupeGeneralNews(generalNews)
            .filter((article) => {
                const articleDate = article.datetime ? article.datetime * 1000 : 0;
                const fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - 5);
                return articleDate >= fromDate.getTime();
            })
            .sort(sortByDateDesc)
            .slice(0, 6);

        return deduped.map((article, index) => formatArticle(article, false, undefined, index));
    } catch (error) {
        console.error('Failed to fetch news:', error);
        throw new Error('Failed to fetch news');
    }
};
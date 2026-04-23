import TradingViewWidget from '@/components/TradingViewWidget';
import WatchlistButton from '@/components/WatchlistButton';
import { getWatchlistSymbolsByEmail } from '@/lib/actions/watchlist.actions';
import { getAuth } from '@/lib/better_auth/auth';
import {
    BASELINE_WIDGET_CONFIG,
    CANDLE_CHART_WIDGET_CONFIG,
    COMPANY_FINANCIALS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
    SYMBOL_INFO_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
} from '@/lib/constants';
import { headers } from 'next/headers';

const EMBED_BASE_URL = 'https://s3.tradingview.com/external-embedding/embed-widget-';

const SYMBOL_INFO_SCRIPT = `${EMBED_BASE_URL}symbol-info.js`;
const ADVANCED_CHART_SCRIPT = `${EMBED_BASE_URL}advanced-chart.js`;
const TECHNICAL_ANALYSIS_SCRIPT = `${EMBED_BASE_URL}technical-analysis.js`;
const COMPANY_PROFILE_SCRIPT = `${EMBED_BASE_URL}symbol-profile.js`;
const COMPANY_FINANCIALS_SCRIPT = `${EMBED_BASE_URL}financials.js`;

const StockDetails = async ({ params }: StockDetailsPageProps) => {
    const { symbol } = await params;
    const normalizedSymbol = symbol.toUpperCase();
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    const watchlistSymbols = session?.user?.email
        ? await getWatchlistSymbolsByEmail(session.user.email)
        : [];
    const isInWatchlist = watchlistSymbols.includes(normalizedSymbol);

    return (
        <div className="stock-details-container grid">
            <section className="stock-details-panel">
                <TradingViewWidget
                    scriptUrl={SYMBOL_INFO_SCRIPT}
                    config={SYMBOL_INFO_WIDGET_CONFIG(normalizedSymbol)}
                    height={170}
                />
                <TradingViewWidget
                    scriptUrl={ADVANCED_CHART_SCRIPT}
                    config={CANDLE_CHART_WIDGET_CONFIG(normalizedSymbol)}
                    height={600}
                />
                <TradingViewWidget
                    scriptUrl={ADVANCED_CHART_SCRIPT}
                    config={BASELINE_WIDGET_CONFIG(normalizedSymbol)}
                    height={600}
                />
            </section>

            <section className="stock-details-panel">
                <WatchlistButton symbol={normalizedSymbol} company={normalizedSymbol} isInWatchlist={isInWatchlist} />
                <TradingViewWidget
                    scriptUrl={TECHNICAL_ANALYSIS_SCRIPT}
                    config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(normalizedSymbol)}
                    height={400}
                />
                <TradingViewWidget
                    scriptUrl={COMPANY_PROFILE_SCRIPT}
                    config={COMPANY_PROFILE_WIDGET_CONFIG(normalizedSymbol)}
                    height={440}
                />
                <TradingViewWidget
                    scriptUrl={COMPANY_FINANCIALS_SCRIPT}
                    config={COMPANY_FINANCIALS_WIDGET_CONFIG(normalizedSymbol)}
                    height={464}
                />
            </section>
        </div>
    );
};

export default StockDetails;

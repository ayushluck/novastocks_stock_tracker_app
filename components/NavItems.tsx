'use client'

import { NAV_ITEMS } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchCommand from "@/components/SearchCommand";

type WatchlistNavItem = {
  symbol: string;
  company: string;
  addedAt: Date;
};

const NavItems = ({
  initialStocks,
  watchlistItems = [],
}: {
  initialStocks: StockWithWatchlistStatus[];
  watchlistItems?: WatchlistNavItem[];
}) => {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';

    return pathname.startsWith(path);
  }

  return (
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
      {NAV_ITEMS.map(({ href, label }) => {
        if (href === '/search') return (
          <li key="search-trigger">
            <SearchCommand
              renderAs="text"
              label="Search"
              initialStocks={initialStocks}
            />
          </li>
        )

        if (href === '/watchlist') {
          return (
            <li key="watchlist-link">
              <Link
                href="/watchlist"
                className={`hover:text-yellow-500 transition-colors ${isActive('/watchlist') ? 'text-gray-100' : ''}`}
              >
                Watchlist ({watchlistItems.length})
              </Link>
            </li>
          );
        }

        return <li key={href}>
          <Link href={href} className={`hover:text-yellow-500 transition-colors ${isActive(href) ? 'text-gray-100' : ''
            }`}>
            {label}
          </Link>
        </li>
      })}
    </ul>
  )
}
export default NavItems
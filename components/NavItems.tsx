'use client';

import { NAV_ITEMS } from '@/lib/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavItems = ({ mobile = false }: { mobile?: boolean }) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(path);
  };

  return (
    <ul
      className={`flex flex-col p-2 gap-2 font-medium ${
        mobile ? '' : 'sm:flex-row sm:gap-10'
      }`}
    >
      {NAV_ITEMS.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={`hover:text-yellow-500 transition-colors ${
              isActive(item.href) ? 'text-gray-100' : ''
            }`}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavItems;
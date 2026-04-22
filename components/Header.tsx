import Link from "next/link"
import Image from "next/image"
import NavItems from "./NavItems"
import UserDropdown from "./UserDropdown"

const Header = ({ user }: { user: User }) => {
  return (
    <header className="sticky top-0 header">
      <div className="container header-wrapper">
        <Link href="/" className="inline-flex items-center shrink-0">
          <span className="relative block h-14 w-56 overflow-hidden rounded-xl">
            <Image
              src="/assets/images/logo.png"
              alt="NovaStocks"
              fill
              priority
              sizes="224px"
              className="object-cover object-center"
            />
          </span>
        </Link>
        <nav className="hidden sm:block">
          <NavItems />
        </nav>
        <UserDropdown user={user} />
      </div>
    </header>
  )
}

export default Header
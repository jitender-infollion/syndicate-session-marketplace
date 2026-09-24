import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import { APP_ROUTES } from "../../constants/appRoutes";
import { useAuthDialog } from "../../modules/auth/context/AuthDialogContext";
import AccountMenu from "./AccountMenu";
import ThemeToggle from "../theme-toggle/ThemeToggle";
import SearchBar from "../searchbar/SearchBar";
import { isLoggedIn, logout, useIsLoggedIn } from "../../utils/authUtils";
import { getStorageItem } from "../../utils/storageUtils";
import { useCart } from "../../modules/cart/hooks/useCart";

type HeaderProps = {
  isSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  isExtraComponent?: boolean;
  component?: ReactNode;
};

export default function Header({
  isSearch = false,
  searchPlaceholder = "",
  searchValue = "",
  onSearch,
  isExtraComponent = false,
  component,
}: HeaderProps) {
  const { openAuthDialog } = useAuthDialog();
  // Reactive - re-renders the instant login state changes elsewhere (e.g.
  // logout), rather than only reflecting it whenever this component happens
  // to next re-render for some unrelated reason.
  const loggedIn = useIsLoggedIn();
  const userName = getStorageItem<string>("userName");
  const { items: cartItems } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // The header is `fixed`, so pages reserve space for it with padding-top.
  // Its real height varies (search bar wrapping onto its own row below `lg`,
  // a long account name wrapping the nav row below `sm`, the mobile search
  // row toggling open, etc.), so a static Tailwind value goes stale the
  // moment that content changes - this keeps --header-height in sync with
  // whatever actually renders.
  useLayoutEffect(() => {
    const node = headerRef.current;
    if (!node) return;

    const setHeightVar = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${node.offsetHeight}px`,
      );
    };
    setHeightVar();

    const observer = new ResizeObserver(setHeightVar);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (searchParams.get("authRequired") && !isLoggedIn()) {
      const redirectUrl = searchParams.get("redirect_url");
      openAuthDialog("signin", () => {
        if (redirectUrl) navigate(redirectUrl);
      });
      searchParams.delete("authRequired");
      searchParams.delete("redirect_url");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const cartLink = (
    <Link
      to={APP_ROUTES.cart}
      aria-label="Cart"
      className="relative flex items-center p-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.87-4.594 2.242-6.65a.75.75 0 0 0-.72-.9H5.106M7.5 14.25 5.106 5.25M7.5 14.25 5.106 5.25"
        />
        <circle cx="9" cy="20.25" r="0.75" fill="currentColor" stroke="none" />
        <circle
          cx="18"
          cy="20.25"
          r="0.75"
          fill="currentColor"
          stroke="none"
        />
      </svg>
      {cartItems.length > 0 && (
        <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-accent-2 text-[11px] font-semibold text-white">
          {cartItems.length}
        </span>
      )}
    </Link>
  );

  const authSection = loggedIn ? (
    <AccountMenu userName={userName} />
  ) : (
    <div className="flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1.5 text-sm sm:px-4 sm:py-2">
      <button
        type="button"
        onClick={() => openAuthDialog("signin")}
        className="cursor-pointer font-bold text-accent-2 hover:opacity-75 transition-colors"
      >
        Login
      </button>
      <span className="text-accent-2/30">|</span>
      <button
        type="button"
        onClick={() => openAuthDialog("register")}
        className="cursor-pointer font-bold text-accent-2 hover:opacity-75 transition-colors"
      >
        Sign up
      </button>
    </div>
  );

  const logo = (
    <Link to={APP_ROUTES.home} className="flex shrink-0 items-center">
      <img
        src="/assets/logo_hd.png"
        alt="Infollion"
        className="h-8 w-auto dark:hidden md:h-10"
      />
      <img
        src="/assets/logo_hd_dark_mode.png"
        alt="Infollion"
        className="hidden h-8 w-auto dark:block md:h-10"
      />
    </Link>
  );

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 w-full bg-white dark:bg-[#1c1f2b] border-b border-gray-100 dark:border-gray-800/60 shadow-sm"
    >
      {/* Desktop/tablet: full inline header, unchanged from before. */}
      <div className="mx-auto hidden max-w-[1440px] items-center justify-between gap-3 px-6 py-2 sm:px-12 lg:flex lg:gap-6 lg:px-20">
        {logo}

        {isSearch && (
          <div className="flex w-auto max-w-3xl flex-1 items-center gap-3">
            <div className="min-w-0 flex-1">
              <SearchBar
                placeholder={searchPlaceholder}
                searchValue={searchValue}
                onSearch={onSearch ?? (() => {})}
                maxWidth="100%"
                height="40px"
              />
            </div>
            {isExtraComponent && <div className="w-auto">{component}</div>}
          </div>
        )}

        <nav className="flex shrink-0 items-center gap-2 text-sm text-text-primary sm:gap-4">
          {!isSearch && isExtraComponent && component}
          <ThemeToggle />
          {cartLink}
          {authSection}
        </nav>
      </div>

      {/* Mobile: compact single row (logo + search/cart/menu icons), with
          search and account/theme tucked behind their own toggles instead of
          wrapping the header onto extra rows. */}
      <div className="flex flex-col lg:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-2 sm:px-6">
          {logo}
          <div className="flex shrink-0 items-center gap-1">
            {isSearch && (
              <IconButton
                aria-label={isMobileSearchOpen ? "Close search" : "Search"}
                onClick={() => setIsMobileSearchOpen((prev) => !prev)}
                sx={{ color: "inherit" }}
              >
                {isMobileSearchOpen ? (
                  <CloseIcon fontSize="medium" />
                ) : (
                  <SearchIcon fontSize="medium" />
                )}
              </IconButton>
            )}
            {cartLink}
            <IconButton
              aria-label="Menu"
              onClick={() => setIsDrawerOpen(true)}
              sx={{ color: "inherit" }}
            >
              <MenuIcon fontSize="medium" />
            </IconButton>
          </div>
        </div>

        {isSearch && isMobileSearchOpen && (
          <div className="flex flex-col gap-2 px-4 pb-3 sm:px-6">
            <SearchBar
              placeholder={searchPlaceholder}
              searchValue={searchValue}
              onSearch={onSearch ?? (() => {})}
              maxWidth="100%"
              height="40px"
            />
            {isExtraComponent && (
              <div className="self-end">{component}</div>
            )}
          </div>
        )}
      </div>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          className:
            "bg-white dark:bg-[#333333] text-text-primary w-[300px] max-w-[85vw] shadow-2xl border-l border-gray-200 dark:border-gray-800",
          sx: { backgroundImage: "none" },
        }}
      >
        <div className="flex min-h-full flex-col gap-2 p-4 bg-white dark:bg-[#333333] text-text-primary">
          <div className="flex items-center justify-between pb-1">
            {logo}
            <IconButton
              aria-label="Close menu"
              onClick={() => setIsDrawerOpen(false)}
              sx={{ color: "inherit", p: 0.5 }}
            >
              <CloseIcon fontSize="medium" />
            </IconButton>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-base font-normal text-gray-700 dark:text-gray-300">
              Theme
            </span>
            <ThemeToggle />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700/60 my-0.5" />

          <div className="flex flex-col gap-2.5 pt-1">
            {loggedIn ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-3 rounded-xl bg-accent/15 dark:bg-[#42392d]/60 p-3 border border-orange-500/10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-2 text-white font-bold">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <span className="truncate text-base font-semibold text-text-primary">
                    {userName || "User"}
                  </span>
                </div>
                <Link
                  to={APP_ROUTES.profile}
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-[#fff8ee] dark:bg-[#42392d] hover:bg-[#ffeedb] dark:hover:bg-[#4e4335] px-4 py-2.5 text-base font-bold text-accent-2 transition-all shadow-sm"
                >
                  <PersonOutlineIcon fontSize="small" />
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsDrawerOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#fff8ee] dark:bg-[#42392d] hover:bg-[#ffeedb] dark:hover:bg-[#4e4335] px-4 py-2.5 text-left text-base font-bold text-accent-2 transition-all shadow-sm"
                >
                  <LogoutIcon fontSize="small" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    openAuthDialog("signin");
                    setIsDrawerOpen(false);
                  }}
                  className="w-full cursor-pointer rounded-xl bg-[#fff8ee] dark:bg-[#42392d] hover:bg-[#ffeedb] dark:hover:bg-[#4e4335] px-4 py-2.5 text-left text-base font-bold text-accent-2 transition-all shadow-sm"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openAuthDialog("register");
                    setIsDrawerOpen(false);
                  }}
                  className="w-full cursor-pointer rounded-xl bg-[#fff8ee] dark:bg-[#42392d] hover:bg-[#ffeedb] dark:hover:bg-[#4e4335] px-4 py-2.5 text-left text-base font-bold text-accent-2 transition-all shadow-sm"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
}

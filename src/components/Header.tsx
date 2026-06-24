import { useState } from "react";
import { useCart } from "@/context/CartContext";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-sky-600 to-cyan-500 text-white text-center py-2 px-4 text-xs sm:text-sm font-medium">
        <div className="flex items-center justify-center gap-2 overflow-hidden">
          <span className="animate-pulse">🔥</span>
          <span>Livraison GRATUITE en France • Plus de 3 200 animaux protégés</span>
          <span className="animate-pulse">🐾</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white text-lg">🐾</span>
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-sky-600">Cool</span>
                <span className="text-slate-800">Pet</span>
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => onNavigate("home")}
                className={`text-sm font-medium transition-colors ${
                  currentPage === "home"
                    ? "text-sky-600"
                    : "text-slate-600 hover:text-sky-600"
                }`}
              >
                Accueil
              </button>
              <button
                onClick={() => {
                  onNavigate("home");
                  setTimeout(() => {
                    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
              >
                Produits
              </button>
              <button
                onClick={() => {
                  onNavigate("home");
                  setTimeout(() => {
                    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors"
              >
                Avis
              </button>
            </nav>

            {/* Cart + Mobile Menu */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate("cart")}
                className="relative p-2 rounded-xl hover:bg-sky-50 transition-colors group"
              >
                <svg
                  className="w-6 h-6 text-slate-700 group-hover:text-sky-600 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-slate-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white animate-slide-down">
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={() => { onNavigate("home"); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                Accueil
              </button>
              <button
                onClick={() => {
                  onNavigate("home");
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                Produits
              </button>
              <button
                onClick={() => {
                  onNavigate("home");
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                Avis
              </button>
              <button
                onClick={() => { onNavigate("cart"); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                🛒 Panier ({totalItems})
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

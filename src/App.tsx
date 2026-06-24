import { useState, useEffect } from "react";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import Home from "@/pages/Home";
import CartPage from "@/pages/Cart";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.hash.replace("#", "") || "home";
      setCurrentPage(path);
    };
    window.addEventListener("popstate", handlePopState);

    // Set initial page from hash
    const initialHash = window.location.hash.replace("#", "");
    if (initialHash) {
      setCurrentPage(initialHash);
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update hash on navigation
  useEffect(() => {
    const hash = currentPage === "home" ? "" : `#${currentPage}`;
    if (window.location.hash !== hash) {
      window.history.pushState(null, "", hash || window.location.pathname);
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <SEOHead page={currentPage} />
      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentPage === "home" && <Home />}
        {currentPage === "cart" && <CartPage onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

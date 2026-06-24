import { useState } from "react";
import { getIndividualProducts } from "@/data/products";
import type { Product } from "@/data/products";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import BundleSection from "@/components/BundleSection";
import ReviewsSection from "@/components/ReviewsSection";
import ProductModal from "@/components/ProductModal";

export default function Home() {
  const individualProducts = getIndividualProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    document.body.style.overflow = "";
  };

  return (
    <>
      {/* Hero */}
      <HeroSection onNavigateProducts={scrollToProducts} />

      {/* Features Bar */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🚚", title: "Livraison gratuite", desc: "France métropolitaine" },
              { icon: "↩️", title: "Retour 30 jours", desc: "Satisfait ou remboursé" },
              { icon: "🔒", title: "Paiement sécurisé", desc: "Stripe & 3D Secure" },
              { icon: "📦", title: "Suivi en temps réel", desc: "Tracking automatique" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{f.title}</p>
                  <p className="text-xs text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">
            Nos produits <span className="gradient-text-cool">rafraîchissants</span>
          </h2>
          <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto">
            Chaque produit est conçu pour le confort et la sécurité de votre compagnon pendant les chaleurs estivales.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {individualProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewProduct={handleViewProduct}
            />
          ))}
        </div>
      </section>

      {/* Bundle Pack Section */}
      <BundleSection onViewProduct={handleViewProduct} />

      {/* Reviews */}
      <ReviewsSection />

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-sky-500 to-cyan-400 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl shadow-sky-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black leading-tight">
              Prêt à protéger votre compagnon ?
            </h2>
            <p className="mt-4 text-sky-100 text-lg max-w-xl mx-auto">
              Rejoignez les +3 200 propriétaires qui ont choisi CoolPet pour garder leur animal au frais cet été.
            </p>
            <button
              onClick={scrollToProducts}
              className="mt-8 px-10 py-4 bg-white text-sky-600 font-bold text-base rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
            >
              Voir nos produits ❄️
            </button>
          </div>
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onViewProduct={(p) => {
            setSelectedProduct(p);
          }}
        />
      )}
    </>
  );
}

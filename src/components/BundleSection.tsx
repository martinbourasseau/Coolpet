import { useState } from "react";
import { getBundleProducts } from "@/data/products";
import { getImageUrl } from "@/lib/imageConfig";
import { useCart } from "@/context/CartContext";
import StarRating from "@/components/StarRating";
import type { Product } from "@/data/products";

interface BundleSectionProps {
  onViewProduct: (product: Product) => void;
}

export default function BundleSection({ onViewProduct }: BundleSectionProps) {
  const bundles = getBundleProducts();
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAdd = (bundle: Product) => {
    addToCart(bundle);
    setAddedId(bundle.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  if (bundles.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {bundles.map((bundle) => (
        <div
          key={bundle.id}
          className="relative bg-gradient-to-br from-sky-50 via-cyan-50 to-amber-50 rounded-3xl overflow-hidden border border-sky-100 shadow-xl"
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-sky-200 opacity-20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-amber-200 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 p-6 md:p-10 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-4 animate-pulse">
                <span>🔥</span>
                <span>Offre limitée</span>
                <span>🔥</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                Pack Été Fraîcheur
              </h2>
              <p className="text-lg text-slate-600 mt-2">
                Économisez{" "}
                <span className="font-bold text-emerald-600">
                  {bundle.originalPrice
                    ? Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)
                    : 0}
                  %
                </span>{" "}
                sur le pack complet
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Product images */}
              <div
                className="grid grid-cols-3 gap-4 cursor-pointer"
                onClick={() => onViewProduct(bundle)}
              >
                {bundle.images.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow border border-white"
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Produit ${i + 1} du ${bundle.name}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{bundle.name}</h3>
                  <p className="text-slate-600 mt-2 leading-relaxed">{bundle.shortDescription}</p>
                </div>

                <StarRating rating={bundle.rating} reviewsCount={bundle.reviewsCount} size="lg" />

                {/* What's included */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Inclus dans le pack :</p>
                  <div className="space-y-2">
                    {["🧣 Bandana Rafraîchissant", "🥤 Gourde Portable", "🐶 Tapis de Léchage"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-slate-900">{bundle.price.toFixed(2)}€</span>
                  {bundle.originalPrice && (
                    <span className="text-xl text-slate-400 line-through">{bundle.originalPrice.toFixed(2)}€</span>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleAdd(bundle)}
                  className={`w-full py-4 rounded-2xl text-lg font-bold transition-all duration-200 ${
                    addedId === bundle.id
                      ? "bg-emerald-500 text-white"
                      : "bg-gradient-to-r from-sky-500 to-cyan-400 text-white hover:from-sky-600 hover:to-cyan-500 shadow-lg shadow-sky-200 hover:shadow-xl active:scale-[0.98]"
                  }`}
                >
                  {addedId === bundle.id ? "✓ Pack ajouté au panier !" : "🛒 Ajouter le pack au panier"}
                </button>

                {/* Trust */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">🔒 Paiement sécurisé</span>
                  <span className="flex items-center gap-1">🚚 Livraison gratuite</span>
                  <span className="flex items-center gap-1">↩️ Satisfait ou remboursé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

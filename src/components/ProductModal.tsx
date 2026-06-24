import { useState } from "react";
import type { Product } from "@/data/products";
import { getImageUrl } from "@/lib/imageConfig";
import { useCart } from "@/context/CartContext";
import StarRating from "@/components/StarRating";
import { getUpsellProducts } from "@/data/products";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onViewProduct: (product: Product) => void;
}

export default function ProductModal({ product, onClose, onViewProduct }: ProductModalProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const upsells = getUpsellProducts(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-modal-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="relative bg-slate-50 p-6 flex flex-col items-center justify-center">
            {product.isBundle ? (
              <div className="grid grid-cols-3 gap-3 w-full">
                {product.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm">
                    <img
                      src={getImageUrl(img)}
                      alt={`Produit ${i + 1} du pack`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white">
                  <img
                    src={getImageUrl(product.images[activeImg])}
                    alt={`${product.name} - CoolPet`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="flex gap-2 mt-3">
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          i === activeImg ? "border-sky-500 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.badge && (
                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  {product.badge}
                </span>
              )}
              {product.isTailleUnique && (
                <span className="bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                  Taille unique
                </span>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{product.name}</h2>

            <div className="mt-2">
              <StarRating rating={product.rating} reviewsCount={product.reviewsCount} size="md" />
            </div>

            <p className="mt-3 text-slate-600 text-sm leading-relaxed">{product.shortDescription}</p>

            {product.isTailleUnique && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 text-sm font-medium px-3 py-1.5 rounded-lg border border-sky-100">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Taille unique – S'adapte à tous les chiens
              </div>
            )}

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">{product.price.toFixed(2)}€</span>
              {product.originalPrice && (
                <span className="text-lg text-slate-400 line-through">{product.originalPrice.toFixed(2)}€</span>
              )}
              {product.originalPrice && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Description Accordion */}
            <div className="mt-4 border border-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setDescOpen(!descOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
              >
                <span>📖 Voir la description complète</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${descOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  descOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 py-3 text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`mt-5 w-full py-3.5 rounded-xl text-base font-bold transition-all duration-200 ${
                added
                  ? "bg-emerald-500 text-white"
                  : "bg-gradient-to-r from-sky-500 to-cyan-400 text-white hover:from-sky-600 hover:to-cyan-500 shadow-lg shadow-sky-200 hover:shadow-xl active:scale-[0.98]"
              }`}
            >
              {added ? "✓ Ajouté au panier !" : "🛒 Ajouter au panier"}
            </button>

            {/* Trust badges */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">🔒 Paiement sécurisé</span>
              <span className="flex items-center gap-1">🚚 Livraison gratuite</span>
              <span className="flex items-center gap-1">↩️ Retour 30 jours</span>
            </div>

            {/* Upsell Section */}
            {upsells.length > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <p className="text-sm font-bold text-amber-800 mb-3">
                  🎯 Complétez votre protection
                </p>
                {upsells.map((upsell) => (
                  <button
                    key={upsell.id}
                    onClick={() => onViewProduct(upsell)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0">
                      <img
                        src={getImageUrl(upsell.images[0])}
                        alt={upsell.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{upsell.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-emerald-600">{upsell.price.toFixed(2)}€</span>
                        {upsell.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">{upsell.originalPrice.toFixed(2)}€</span>
                        )}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

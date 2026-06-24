import { useState } from "react";
import type { Product } from "@/data/products";
import { getImageUrl } from "@/lib/imageConfig";
import { useCart } from "@/context/CartContext";
import StarRating from "@/components/StarRating";

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
}

export default function ProductCard({ product, onViewProduct }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="product-card group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={() => onViewProduct(product)}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-slate-50">
        <img
          src={getImageUrl(product.images[imgIdx])}
          alt={`${product.name} - Accessoire été pour chien CoolPet`}
          className="product-image w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {product.badge}
          </div>
        )}
        {product.isTailleUnique && (
          <div className="absolute top-3 right-3 bg-sky-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Taille unique
          </div>
        )}
        {/* Image dots */}
        {product.images.length > 1 && !product.isBundle && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === imgIdx ? "bg-white shadow-md scale-125" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2.5">
        <h3 className="font-semibold text-slate-800 text-base leading-tight line-clamp-2 group-hover:text-sky-600 transition-colors">
          {product.name}
        </h3>

        <p className="text-slate-500 text-sm line-clamp-2">
          {product.shortDescription}
        </p>

        <StarRating rating={product.rating} reviewsCount={product.reviewsCount} size="sm" />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900">
              {product.price.toFixed(2)}€
            </span>
            {product.originalPrice && (
              <span className="text-sm text-slate-400 line-through">
                {product.originalPrice.toFixed(2)}€
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              added
                ? "bg-emerald-500 text-white scale-95"
                : "bg-gradient-to-r from-sky-500 to-cyan-400 text-white hover:from-sky-600 hover:to-cyan-500 active:scale-[0.98]"
            }`}
          >
            {added ? "✓ Ajouté" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}

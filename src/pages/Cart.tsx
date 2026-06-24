import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/lib/imageConfig";

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsCheckingOut(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
            image: item.image,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la session de paiement");
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de paiement manquante");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer."
      );
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">🛒</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Votre panier est vide</h2>
          <p className="text-slate-500 max-w-sm">
            Découvrez nos accessoires rafraîchissants pour protéger votre compagnon cet été.
          </p>
          <button
            onClick={() => onNavigate("home")}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-sky-200 hover:shadow-xl hover:from-sky-600 hover:to-cyan-500 transition-all active:scale-[0.98]"
          >
            Voir les produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Mon Panier</h1>
          <p className="text-slate-500 text-sm mt-1">
            {items.reduce((s, i) => s + i.quantity, 0)} article(s)
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
        >
          Vider le panier
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex gap-4 items-center"
            >
              {/* Image */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm md:text-base truncate">
                  {item.name}
                </h3>
                <p className="text-sky-600 font-bold text-lg mt-1">
                  {item.price.toFixed(2)}€
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Subtotal + Remove */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <p className="font-bold text-slate-900">
                  {(item.price * item.quantity).toFixed(2)}€
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  aria-label="Supprimer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Résumé de commande</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total</span>
                <span className="font-semibold text-slate-800">{totalPrice.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Livraison</span>
                <span className="font-semibold text-emerald-600">Gratuite</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <span className="font-bold text-slate-900 text-base">Total</span>
                <span className="font-black text-slate-900 text-xl">{totalPrice.toFixed(2)}€</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="mt-5 w-full py-4 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-bold text-base rounded-xl shadow-lg shadow-sky-200 hover:shadow-xl hover:from-sky-600 hover:to-cyan-500 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCheckingOut ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Redirection...
                </>
              ) : (
                <>
                  🔒 Passer au paiement
                </>
              )}
            </button>

            {/* Trust */}
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>🔒</span> Paiement sécurisé via Stripe
              </div>
              <div className="flex items-center gap-2">
                <span>🚚</span> Livraison gratuite en France
              </div>
              <div className="flex items-center gap-2">
                <span>↩️</span> Retour gratuit sous 30 jours
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Shopping */}
      <div className="mt-8 text-center">
        <button
          onClick={() => onNavigate("home")}
          className="text-sky-600 hover:text-sky-700 font-medium text-sm transition-colors inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Continuer mes achats
        </button>
      </div>
    </div>
  );
}

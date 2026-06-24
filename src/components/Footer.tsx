interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <button onClick={() => onNavigate("home")} className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-lg">🐾</span>
              </div>
              <span className="text-xl font-bold">
                <span className="text-sky-400">Cool</span>
                <span className="text-white">Pet</span>
              </span>
            </button>
            <p className="text-slate-400 text-sm leading-relaxed">
              Accessoires premium pour garder votre compagnon au frais tout l'été. +3 200 animaux protégés.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Boutique</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    onNavigate("home");
                    setTimeout(() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }), 100);
                  }}
                  className="text-slate-400 hover:text-sky-400 text-sm transition-colors"
                >
                  Tous les produits
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate("cart")} className="text-slate-400 hover:text-sky-400 text-sm transition-colors">
                  Mon panier
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>📧 contact@coolpet.fr</li>
              <li>🚚 Livraison gratuite</li>
              <li>↩️ Retours sous 30 jours</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Garanties</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span>🔒</span> Paiement sécurisé
              </li>
              <li className="flex items-center gap-2">
                <span>✅</span> Satisfait ou remboursé
              </li>
              <li className="flex items-center gap-2">
                <span>📦</span> Suivi en temps réel
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} CoolPet. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 text-xs">Paiement sécurisé par</span>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <span className="bg-slate-800 px-2 py-1 rounded">Visa</span>
              <span className="bg-slate-800 px-2 py-1 rounded">Mastercard</span>
              <span className="bg-slate-800 px-2 py-1 rounded">Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

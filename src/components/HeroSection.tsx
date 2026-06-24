import { getImageUrl } from "@/lib/imageConfig";

interface HeroSectionProps {
  onNavigateProducts: () => void;
}

export default function HeroSection({ onNavigateProducts }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-cyan-50">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-sky-200 opacity-25 rounded-full blur-3xl animate-blob" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-200 opacity-20 rounded-full blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-amber-200 opacity-15 rounded-full blur-3xl animate-blob" style={{ animationDelay: "8s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div className="text-center md:text-left order-2 md:order-1">
            <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 animate-fade-in-up">
              <span>❄️</span>
              <span>Collection Été 2025</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] animate-fade-in-up delay-100">
              Protégez votre{" "}
              <span className="gradient-text-cool">compagnon</span>{" "}
              de la chaleur
            </h1>

            <p className="mt-5 text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg animate-fade-in-up delay-200">
              Accessoires rafraîchissants premium pour garder votre chien au frais tout l'été.{" "}
              <span className="font-semibold text-slate-700">+3 200 animaux protégés.</span>
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start animate-fade-in-up delay-300">
              <button
                onClick={onNavigateProducts}
                className="px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-400 text-white font-bold text-base rounded-2xl shadow-lg shadow-sky-200 hover:shadow-xl hover:from-sky-600 hover:to-cyan-500 transition-all active:scale-[0.98] group"
              >
                <span className="flex items-center justify-center gap-2">
                  Découvrir nos produits
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
              <button
                onClick={() => {
                  document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 bg-white text-slate-700 font-semibold text-base rounded-2xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 shadow-sm hover:shadow-md transition-all"
              >
                ⭐ Voir les avis
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-8 flex items-center gap-6 justify-center md:justify-start animate-fade-in-up delay-400">
              <div className="flex -space-x-2">
                {["🧑", "👩", "👨", "👩‍🦰"].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full border-2 border-white flex items-center justify-center text-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-slate-700">4.8/5</span> basé sur 989 avis
                </p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="order-1 md:order-2 flex justify-center animate-fade-in-up delay-200">
            <div className="relative">
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl shadow-sky-900/20 border-4 border-white animate-float">
                <img
                  src={getImageUrl("/images/hero-dog.jpg")}
                  alt="Chien heureux avec accessoires rafraîchissants CoolPet"
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
              {/* Floating badges */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-2 animate-fade-in-up delay-500">
                <span className="text-2xl">🚚</span>
                <div>
                  <p className="text-xs font-bold text-slate-800">Livraison gratuite</p>
                  <p className="text-xs text-slate-500">France métropolitaine</p>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-white rounded-2xl shadow-lg p-3 flex items-center gap-2 animate-fade-in-up delay-600">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-xs font-bold text-slate-800">Satisfait ou remboursé</p>
                  <p className="text-xs text-slate-500">30 jours pour changer d'avis</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

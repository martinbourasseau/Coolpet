import { reviews } from "@/data/reviews";

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900">
          Ce que disent nos clients
        </h2>
        <p className="text-slate-500 mt-3 text-lg">
          Plus de <span className="font-bold text-sky-600">3 200</span> animaux protégés cet été
        </p>
        <div className="flex items-center justify-center gap-1 mt-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="ml-2 text-lg font-bold text-slate-700">4.8/5</span>
          <span className="text-slate-400 ml-1">(989 avis)</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full flex items-center justify-center text-lg">
                {review.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-sm">{review.name}</span>
                  {review.verified && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Vérifié
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">{review.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-0.5 mb-2">
              {Array.from({ length: review.rating }).map((_, i) => (
                <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <p className="text-xs text-sky-600 font-medium mb-2">{review.product}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

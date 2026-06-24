import { useEffect } from "react";
import type { Product } from "@/data/products";
import { getImageUrl } from "@/lib/imageConfig";

interface SEOHeadProps {
  product?: Product;
  page?: string;
}

export default function SEOHead({ product, page }: SEOHeadProps) {
  useEffect(() => {
    // Clean up previous JSON-LD
    document.querySelectorAll('script[data-seo="coolpet"]').forEach((el) => el.remove());

    if (product) {
      // Product JSON-LD
      const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images.map((img) => `https://coolpet.vercel.app${getImageUrl(img)}`),
        brand: { "@type": "Brand", name: "CoolPet" },
        offers: {
          "@type": "Offer",
          url: `https://coolpet.vercel.app/produit/${product.slug}`,
          priceCurrency: "EUR",
          price: product.price.toFixed(2),
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: "CoolPet" },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating.toString(),
          reviewCount: product.reviewsCount.toString(),
          bestRating: "5",
          worstRating: "1",
        },
      };

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "coolpet");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);

      // Update meta tags
      document.title = `${product.name} | CoolPet`;
      updateMeta("description", product.shortDescription + " - CoolPet, accessoires été pour chien.");
      updateMeta("og:title", `${product.name} | CoolPet`);
      updateMeta("og:description", product.shortDescription);
      updateMeta("og:image", `https://coolpet.vercel.app${getImageUrl(product.images[0])}`);
      updateMeta("og:type", "product");
    } else {
      // Default page SEO
      const titles: Record<string, string> = {
        home: "CoolPet | Accessoires d'été pour rafraîchir votre chien",
        cart: "Mon Panier | CoolPet",
      };
      const descriptions: Record<string, string> = {
        home: "Découvrez CoolPet, la boutique premium d'accessoires d'été pour chiens : bandana rafraîchissant, gourde portable et tapis de léchage. +3 200 animaux protégés.",
        cart: "Finalisez votre commande CoolPet. Livraison gratuite en France. Paiement sécurisé par Stripe.",
      };

      const currentPage = page || "home";
      document.title = titles[currentPage] || titles.home;
      updateMeta("description", descriptions[currentPage] || descriptions.home);
      updateMeta("og:title", titles[currentPage] || titles.home);
      updateMeta("og:description", descriptions[currentPage] || descriptions.home);
      updateMeta("og:type", "website");

      // Website JSON-LD
      const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "WebSite",
        name: "CoolPet",
        url: "https://coolpet.vercel.app/",
        description: "Boutique premium d'accessoires d'été pour protéger votre chien de la chaleur.",
      };

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "coolpet");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.querySelectorAll('script[data-seo="coolpet"]').forEach((el) => el.remove());
    };
  }, [product, page]);

  return null;
}

function updateMeta(name: string, content: string) {
  const isOg = name.startsWith("og:");
  const selector = isOg
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;

  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    if (isOg) {
      el.setAttribute("property", name);
    } else {
      el.setAttribute("name", name);
    }
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

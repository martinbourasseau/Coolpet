export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  shortDescription: string;
  description: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  isBundle?: boolean;
  isTailleUnique?: boolean;
  bundleProductIds?: string[];
  upsellIds?: string[];
  badge?: string;
}

export const products: Product[] = [
  {
    id: "bandana-rafraichissant",
    name: "Bandana Rafraîchissant",
    slug: "bandana-rafraichissant-chien",
    price: 19.99,
    shortDescription: "Bandana rafraîchissant taille unique adaptable.",
    description:
      "Bandana rafraîchissant taille unique conçu pour s'adapter confortablement à la majorité des chiens grâce à son tissu respirant et ajustable. Il suffit de le tremper dans l'eau froide, de l'essorer et de le nouer autour du cou de votre compagnon pour une fraîcheur longue durée. Matière légère et douce, idéale pour les promenades estivales et les journées de forte chaleur. Lavable en machine. Convient à toutes les races.",
    images: [
      "/images/products/bandana-rafraichissant/main.jpg",
      "/images/products/bandana-rafraichissant/lifestyle.jpg",
    ],
    rating: 4.8,
    reviewsCount: 187,
    isTailleUnique: true,
    upsellIds: ["pack-ete-3"],
    badge: "Bestseller",
  },
  {
    id: "gourde-portable",
    name: "Gourde Portable Chien",
    slug: "gourde-portable-chien",
    price: 24.99,
    shortDescription: "Gourde portable avec bec verseur intégré pour hydrater votre chien partout.",
    description:
      "Gourde portable spécialement conçue pour les chiens, avec un bec verseur intégré formant un abreuvoir pratique. Capacité de 500 ml, suffisante pour les longues balades. Matériaux BPA-free, sans danger pour votre animal. Système anti-fuite breveté : glissez-la dans votre sac sans souci. Design ergonomique avec bouton de verrouillage one-click. Parfaite pour la randonnée, le parc ou la voiture.",
    images: [
      "/images/products/gourde-portable/main.jpg",
      "/images/products/gourde-portable/lifestyle.jpg",
    ],
    rating: 4.7,
    reviewsCount: 234,
    upsellIds: ["pack-ete-3"],
  },
  {
    id: "tapis-lechage",
    name: "Tapis de Léchage Anti-Stress",
    slug: "tapis-lechage-chien",
    price: 14.99,
    shortDescription: "Tapis de léchage en silicone alimentaire pour occuper et calmer votre chien.",
    description:
      "Tapis de léchage en silicone alimentaire de qualité premium, conçu pour réduire le stress et l'anxiété de votre chien. Étalez du beurre de cacahuète, du yaourt ou de la pâtée sur les motifs texturés pour une stimulation mentale longue durée. Ventouses ultra-adhérentes sur la face arrière : se fixe au sol, au mur ou à la baignoire. Passe au lave-vaisselle. Favorise une digestion lente et saine.",
    images: [
      "/images/products/tapis-lechage/main.jpg",
      "/images/products/tapis-lechage/lifestyle.jpg",
    ],
    rating: 4.6,
    reviewsCount: 156,
    upsellIds: ["pack-ete-3"],
  },
  {
    id: "pack-ete-3",
    name: "Pack Été Fraîcheur (3 Produits)",
    slug: "pack-ete-fraicheur",
    price: 49.99,
    originalPrice: 59.97,
    shortDescription: "Le pack complet pour protéger votre animal cet été.",
    description:
      "Inclut : Bandana rafraîchissant + Gourde portable + Tapis de léchage. L'ensemble indispensable pour garder votre chien au frais et heureux tout l'été. Économisez par rapport à l'achat séparé et offrez à votre compagnon le trio gagnant contre la chaleur.",
    images: [
      "/images/products/bandana-rafraichissant/main.jpg",
      "/images/products/gourde-portable/main.jpg",
      "/images/products/tapis-lechage/main.jpg",
    ],
    rating: 4.9,
    reviewsCount: 412,
    isBundle: true,
    bundleProductIds: ["bandana-rafraichissant", "gourde-portable", "tapis-lechage"],
    badge: "Offre limitée",
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getIndividualProducts(): Product[] {
  return products.filter((p) => !p.isBundle);
}

export function getBundleProducts(): Product[] {
  return products.filter((p) => p.isBundle);
}

export function getUpsellProducts(productId: string): Product[] {
  const product = getProductById(productId);
  if (!product?.upsellIds) return [];
  return product.upsellIds
    .map((id) => getProductById(id))
    .filter((p): p is Product => p !== undefined);
}

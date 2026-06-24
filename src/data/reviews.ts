export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  product: string;
  text: string;
  verified: boolean;
}

export const reviews: Review[] = [
  {
    id: "r1",
    name: "Marie D.",
    avatar: "👩",
    rating: 5,
    date: "Il y a 3 jours",
    product: "Bandana Rafraîchissant",
    text: "Mon labrador adore son bandana ! Il reste frais pendant des heures. La qualité est top, je recommande vivement. On va pouvoir profiter de l'été sereinement.",
    verified: true,
  },
  {
    id: "r2",
    name: "Thomas L.",
    avatar: "👨",
    rating: 5,
    date: "Il y a 1 semaine",
    product: "Pack Été Fraîcheur",
    text: "J'ai pris le pack complet et franchement c'est le meilleur investissement de l'été. La gourde est super pratique en balade et le tapis occupe mon chien pendant des heures.",
    verified: true,
  },
  {
    id: "r3",
    name: "Sophie M.",
    avatar: "👩‍🦰",
    rating: 5,
    date: "Il y a 2 semaines",
    product: "Gourde Portable",
    text: "Plus besoin de chercher un point d'eau en rando ! La gourde est légère, ne fuit pas et mon berger australien boit facilement dedans. Livraison rapide en plus.",
    verified: true,
  },
  {
    id: "r4",
    name: "Pierre B.",
    avatar: "👨‍🦱",
    rating: 4,
    date: "Il y a 2 semaines",
    product: "Tapis de Léchage",
    text: "Le tapis de léchage est génial pour calmer mon chiot anxieux. Les ventouses tiennent bien au sol. J'en ai commandé un deuxième pour la salle de bain.",
    verified: true,
  },
  {
    id: "r5",
    name: "Camille R.",
    avatar: "👩‍🦳",
    rating: 5,
    date: "Il y a 3 semaines",
    product: "Pack Été Fraîcheur",
    text: "Pack reçu en 5 jours, très bien emballé. Les 3 produits sont de super qualité. Mon golden est paré pour l'été ! Le bandana est son préféré.",
    verified: true,
  },
  {
    id: "r6",
    name: "Lucas G.",
    avatar: "👨‍🦲",
    rating: 5,
    date: "Il y a 1 mois",
    product: "Bandana Rafraîchissant",
    text: "Taille unique qui s'adapte parfaitement à mon bouledogue français. Le tissu est doux et sèche vite. Excellent rapport qualité-prix.",
    verified: true,
  },
];

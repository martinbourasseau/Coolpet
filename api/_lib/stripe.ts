/**
 * 🔧 CoolPet - Configuration Stripe
 * 
 * Ce fichier contient :
 * - L'initialisation du client Stripe
 * - Les types pour le panier
 * - La liste des pays francophones autorisés
 * - La validation des articles du panier
 */

import Stripe from 'stripe';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔑 INITIALISATION STRIPE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('❌ STRIPE_SECRET_KEY est manquante dans les variables d\'environnement');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  cjProductId: string;
  cjVariantId: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌍 PAYS FRANCOPHONES AUTORISÉS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ALLOWED_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = [
  // Europe francophone
  'FR', // France
  'BE', // Belgique
  'CH', // Suisse
  'LU', // Luxembourg
  'MC', // Monaco
  // Amérique du Nord
  'CA', // Canada
  // Afrique francophone
  'SN', // Sénégal
  'CI', // Côte d'Ivoire
  'CM', // Cameroun
  'MG', // Madagascar
  'ML', // Mali
  'BF', // Burkina Faso
  'NE', // Niger
  'TG', // Togo
  'BJ', // Bénin
  'GA', // Gabon
  'CG', // Congo
  'CD', // RD Congo
  'TD', // Tchad
  'GN', // Guinée
  'DJ', // Djibouti
  'KM', // Comores
  'MU', // Maurice
  'SC', // Seychelles
  'RW', // Rwanda
  'BI', // Burundi
  'MR', // Mauritanie
  'GW', // Guinée-Bissau
  'ST', // São Tomé-et-Príncipe
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ VALIDATION DU PANIER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateCartItems(items: CartItem[]): ValidationResult {
  // Vérifier que items est un tableau
  if (!Array.isArray(items)) {
    console.log('❌ Validation panier : items n\'est pas un tableau');
    return { valid: false, error: 'Le panier doit être un tableau d\'articles' };
  }

  // Vérifier que le panier n'est pas vide
  if (items.length === 0) {
    console.log('❌ Validation panier : panier vide');
    return { valid: false, error: 'Le panier est vide' };
  }

  // Vérifier le nombre maximum d'articles
  if (items.length > 20) {
    console.log('❌ Validation panier : trop d\'articles (' + items.length + ')');
    return { valid: false, error: 'Le panier ne peut pas contenir plus de 20 articles différents' };
  }

  // Valider chaque article
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Vérifier les champs requis
    if (!item.id || typeof item.id !== 'string') {
      console.log('❌ Validation panier : article ' + i + ' - id manquant ou invalide');
      return { valid: false, error: `Article ${i + 1} : identifiant manquant` };
    }

    if (!item.name || typeof item.name !== 'string') {
      console.log('❌ Validation panier : article ' + i + ' - name manquant ou invalide');
      return { valid: false, error: `Article ${i + 1} : nom manquant` };
    }

    if (typeof item.price !== 'number' || isNaN(item.price)) {
      console.log('❌ Validation panier : article ' + i + ' - price invalide');
      return { valid: false, error: `Article ${i + 1} : prix invalide` };
    }

    if (typeof item.quantity !== 'number' || isNaN(item.quantity)) {
      console.log('❌ Validation panier : article ' + i + ' - quantity invalide');
      return { valid: false, error: `Article ${i + 1} : quantité invalide` };
    }

    if (!item.cjProductId || typeof item.cjProductId !== 'string') {
      console.log('❌ Validation panier : article ' + i + ' - cjProductId manquant');
      return { valid: false, error: `Article ${i + 1} : référence produit CJ manquante` };
    }

    if (!item.cjVariantId || typeof item.cjVariantId !== 'string') {
      console.log('❌ Validation panier : article ' + i + ' - cjVariantId manquant');
      return { valid: false, error: `Article ${i + 1} : référence variante CJ manquante` };
    }

    // Vérifier les limites de prix (0.50€ - 500€)
    if (item.price < 0.50 || item.price > 500) {
      console.log('❌ Validation panier : article ' + i + ' - prix hors limites (' + item.price + '€)');
      return { valid: false, error: `Article ${i + 1} : le prix doit être entre 0,50€ et 500€` };
    }

    // Vérifier les limites de quantité (1 - 10)
    if (item.quantity < 1 || item.quantity > 10 || !Number.isInteger(item.quantity)) {
      console.log('❌ Validation panier : article ' + i + ' - quantité hors limites (' + item.quantity + ')');
      return { valid: false, error: `Article ${i + 1} : la quantité doit être entre 1 et 10` };
    }
  }

  console.log('✅ Validation panier : ' + items.length + ' article(s) validé(s)');
  return { valid: true };
}

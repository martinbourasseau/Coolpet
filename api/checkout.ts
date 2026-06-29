/**
 * 💳 CoolPet - Création de Session Stripe Checkout
 * 
 * Endpoint : POST /api/create-checkout-session
 * 
 * Ce fichier gère :
 * - La validation du panier
 * - La création de la session Stripe Checkout
 * - La configuration des options de livraison
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { stripe, validateCartItems, ALLOWED_COUNTRIES, CartItem } from './_lib/stripe.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://coolpet.vercel.app';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 HANDLER PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // ─────────────────────────────────────────
  // CORS Headers
  // ─────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Vérification méthode
  if (req.method !== 'POST') {
    console.log('❌ Méthode non autorisée:', req.method);
    res.status(405).json({ error: 'Méthode non autorisée' });
    return;
  }

  console.log('💳 Création de session Stripe Checkout...');

  try {
    // ─────────────────────────────────────────
    // Extraction des données
    // ─────────────────────────────────────────
    const { items, customerEmail } = req.body as {
      items: CartItem[];
      customerEmail?: string;
    };

    console.log('📦 Articles reçus:', items?.length || 0);
    if (customerEmail) {
      console.log('📧 Email client:', customerEmail);
    }

    // ─────────────────────────────────────────
    // Validation du panier
    // ─────────────────────────────────────────
    const validation = validateCartItems(items);
    if (!validation.valid) {
      console.log('❌ Validation panier échouée:', validation.error);
      res.status(400).json({ error: validation.error });
      return;
    }

    // ─────────────────────────────────────────
    // Construction des line items Stripe
    // ─────────────────────────────────────────
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: {
            cjProductId: item.cjProductId,
            cjVariantId: item.cjVariantId,
          },
        },
      },
      quantity: item.quantity,
    }));

    // ─────────────────────────────────────────
    // Sérialisation des items pour metadata
    // ─────────────────────────────────────────
    const metadataItems = items.map((item) => ({
      cjProductId: item.cjProductId,
      cjVariantId: item.cjVariantId,
      quantity: item.quantity,
      name: item.name,
    }));

    // ─────────────────────────────────────────
    // Création de la session Stripe
    // ─────────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'fr',
      line_items: lineItems,
      
      // Collecte de l'adresse de livraison
      shipping_address_collection: {
        allowed_countries: ALLOWED_COUNTRIES,
      },
      
      // Options de livraison
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0, // Livraison gratuite
              currency: 'eur',
            },
            display_name: 'Livraison standard gratuite',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 7,
              },
              maximum: {
                unit: 'business_day',
                value: 15,
              },
            },
          },
        },
      ],
      
      // URLs de redirection
      success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/cart`,
      
      // Email client pré-rempli si fourni
      ...(customerEmail && { customer_email: customerEmail }),
      
      // Metadata pour le webhook
      metadata: {
        items: JSON.stringify(metadataItems),
      },
    });

    console.log('✅ Session Stripe créée:', session.id);
    console.log('🔗 URL Checkout:', session.url);

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création de la session:', error);
    
    // Ne pas exposer les détails d'erreur
    res.status(500).json({
      error: 'Une erreur est survenue lors de la création de la session de paiement',
    });
  }
}

/**
 * 💳 CoolPet - Création de Session Stripe Checkout
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://coolpet.vercel.app';

interface CheckoutItem {
  priceId: string;
  quantity: number;
  name?: string;
  price?: number;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non autorisée' });
    return;
  }

  try {
    const { items, customerEmail } = req.body as {
      items: CheckoutItem[];
      customerEmail?: string;
    };

    console.log('📦 Articles reçus:', items?.length || 0);

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Panier vide' });
      return;
    }

    for (let i = 0; i < items.length; i++) {
      if (!items[i].priceId) {
        res.status(400).json({ error: `Article ${i + 1} : identifiant Stripe manquant` });
        return;
      }
      if (!items[i].quantity || items[i].quantity < 1) {
        res.status(400).json({ error: `Article ${i + 1} : quantité invalide` });
        return;
      }
    }

    // Construction des line items avec les Price IDs Stripe
    const lineItems = items.map((item) => ({
      price: item.priceId,
      quantity: item.quantity,
    }));

    // Création de la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      locale: 'fr',
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC', 'CA'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'eur',
            },
            display_name: 'Livraison standard gratuite',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 7 },
              maximum: { unit: 'business_day', value: 15 },
            },
          },
        },
      ],
      success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/#cart`,
      ...(customerEmail && { customer_email: customerEmail }),
    });

    console.log('✅ Session Stripe créée:', session.id);

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('❌ Erreur Stripe:', error.message || error);
    res.status(500).json({
      error: 'Erreur lors de la création de la session de paiement',
      details: error.message,
    });
  }
}
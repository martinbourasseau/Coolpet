/**
 * 📋 CoolPet - Statut de Commande (après paiement)
 * 
 * Endpoint : GET /api/orders/status?session_id=XXX
 * 
 * Ce fichier gère :
 * - La récupération de commande par session Stripe
 * - Utilisé par la page /success après le paiement
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrderByStripeSession } from '../_lib/orders.js';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Vérification méthode
  if (req.method !== 'GET') {
    console.log('❌ Méthode non autorisée:', req.method);
    res.status(405).json({ error: 'Méthode non autorisée' });
    return;
  }

  console.log('📋 Requête de statut de commande');

  try {
    // ─────────────────────────────────────────
    // Extraction du paramètre
    // ─────────────────────────────────────────
    const { session_id } = req.query as {
      session_id?: string;
    };

    if (!session_id) {
      console.log('❌ session_id manquant');
      res.status(400).json({
        error: 'Le paramètre session_id est requis',
      });
      return;
    }

    console.log('🔍 Session Stripe:', session_id);

    // ─────────────────────────────────────────
    // Récupération de la commande
    // ─────────────────────────────────────────
    const order = await getOrderByStripeSession(session_id);

    if (!order) {
      console.log('❌ Commande non trouvée pour cette session');
      res.status(404).json({
        error: 'Commande non trouvée. Elle peut prendre quelques instants à apparaître.',
      });
      return;
    }

    console.log('✅ Commande trouvée:', order.id);

    // ─────────────────────────────────────────
    // Réponse
    // ─────────────────────────────────────────
    res.status(200).json({
      orderId: order.id,
      status: order.status,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      currency: order.currency,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
      shippingAddress: {
        name: order.shippingAddress.name,
        city: order.shippingAddress.city,
        country: order.shippingAddress.country,
      },
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du statut:', error);
    res.status(500).json({
      error: 'Une erreur est survenue lors de la récupération du statut',
    });
  }
}

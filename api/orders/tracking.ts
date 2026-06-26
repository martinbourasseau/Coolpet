/**
 * 📍 CoolPet - Suivi de Commande
 * 
 * Endpoint : GET /api/orders/tracking?orderId=XXX&email=XXX
 * 
 * Ce fichier gère :
 * - La récupération du statut de commande
 * - La vérification de l'email client
 * - La mise à jour du tracking depuis CJ
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrderById, OrderStatus } from '../_lib/orders';
import { getCJTracking } from '../_lib/cj-dropshipping';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://coolpet.vercel.app';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏷️ LABELS DE STATUT EN FRANÇAIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STATUS_LABELS: Record<OrderStatus, string> = {
  'paid': '✅ Paiement reçu',
  'cj_order_created': '📦 En cours de préparation',
  'cj_order_failed': '⚠️ Erreur de traitement',
  'cj_processing': '🏭 En préparation',
  'shipped': '🚀 Expédié',
  'in_transit': '✈️ En transit',
  'delivered': '🎉 Livré',
  'cancelled': '❌ Annulé',
  'refunded': '💸 Remboursé',
  'payment_failed': '❌ Paiement échoué',
};

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

  console.log('📍 Requête de suivi de commande');

  try {
    // ─────────────────────────────────────────
    // Extraction des paramètres
    // ─────────────────────────────────────────
    const { orderId, email } = req.query as {
      orderId?: string;
      email?: string;
    };

    // Validation
    if (!orderId || !email) {
      console.log('❌ Paramètres manquants - orderId:', orderId, 'email:', email);
      res.status(400).json({
        error: 'Les paramètres orderId et email sont requis',
      });
      return;
    }

    console.log('📦 Commande:', orderId);
    console.log('📧 Email:', email);

    // ─────────────────────────────────────────
    // Récupération de la commande
    // ─────────────────────────────────────────
    const order = await getOrderById(orderId);

    if (!order) {
      console.log('❌ Commande non trouvée:', orderId);
      res.status(404).json({
        error: 'Commande non trouvée',
      });
      return;
    }

    // ─────────────────────────────────────────
    // Vérification de l'email (sécurité)
    // ─────────────────────────────────────────
    if (order.customerEmail.toLowerCase() !== email.toLowerCase()) {
      console.log('❌ Email ne correspond pas');
      console.log('   Attendu:', order.customerEmail.toLowerCase());
      console.log('   Reçu:', email.toLowerCase());
      res.status(403).json({
        error: 'Accès non autorisé à cette commande',
      });
      return;
    }

    // ─────────────────────────────────────────
    // Mise à jour du tracking depuis CJ (si applicable)
    // ─────────────────────────────────────────
    let trackingNumber = order.trackingNumber || null;
    let trackingUrl = order.trackingUrl || null;
    let logisticName = order.logisticName || null;

    // Récupérer le tracking en temps réel si la commande n'est pas livrée
    if (order.cjOrderId && order.status !== 'delivered') {
      try {
        console.log('📍 Récupération tracking CJ en temps réel...');
        const cjTracking = await getCJTracking(order.cjOrderId);
        
        if (cjTracking.trackingNumber) {
          trackingNumber = cjTracking.trackingNumber;
          trackingUrl = cjTracking.trackingUrl;
          logisticName = cjTracking.logisticName;
          console.log('✅ Tracking mis à jour:', trackingNumber);
        }
      } catch (error) {
        console.log('⚠️ Impossible de récupérer le tracking CJ (non bloquant):', error);
        // On continue avec les données en cache
      }
    }

    // ─────────────────────────────────────────
    // Réponse
    // ─────────────────────────────────────────
    const statusLabel = STATUS_LABELS[order.status] || order.status;

    console.log('✅ Suivi récupéré - Status:', order.status);

    res.status(200).json({
      orderId: order.id,
      status: order.status,
      statusLabel: statusLabel,
      trackingNumber: trackingNumber,
      trackingUrl: trackingUrl,
      logisticName: logisticName,
      estimatedDelivery: '7-15 jours ouvrés',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    console.error('❌ Erreur lors du suivi:', error);
    res.status(500).json({
      error: 'Une erreur est survenue lors de la récupération du suivi',
    });
  }
}

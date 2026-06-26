/**
 * 🔔 CoolPet - Webhook CJ Dropshipping
 * 
 * Endpoint : POST /api/webhooks/cj
 * 
 * Ce fichier gère :
 * - Les notifications de changement de statut CJ
 * - La mise à jour des commandes
 * - L'envoi d'email d'expédition
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getOrderById, updateOrderStatus, OrderStatus } from '../_lib/orders';
import { sendShippingEmail } from '../_lib/email';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface CJWebhookPayload {
  type: string;
  data: {
    orderNum: string;
    status: string;
    trackNumber?: string;
    logisticName?: string;
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🗺️ MAPPING STATUTS CJ → INTERNES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CJ_STATUS_MAP: Record<string, OrderStatus> = {
  'CREATED': 'cj_order_created',
  'UNSHIPPED': 'cj_processing',
  'PENDING': 'cj_processing',
  'PROCESSING': 'cj_processing',
  'SHIPPED': 'shipped',
  'IN_TRANSIT': 'in_transit',
  'DELIVERED': 'delivered',
  'CANCELLED': 'cancelled',
  'REFUNDED': 'refunded',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 HANDLER PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Vérification méthode
  if (req.method !== 'POST') {
    console.log('❌ Webhook CJ: méthode non autorisée:', req.method);
    res.status(405).json({ error: 'Méthode non autorisée' });
    return;
  }

  console.log('🔔 Webhook CJ reçu');

  try {
    const payload = req.body as CJWebhookPayload;
    
    console.log('📌 Type:', payload.type);
    console.log('📦 Order:', payload.data?.orderNum);
    console.log('📊 Status CJ:', payload.data?.status);

    // ─────────────────────────────────────────
    // Traitement selon le type
    // ─────────────────────────────────────────
    switch (payload.type) {
      case 'ORDER_STATUS_CHANGE': {
        await handleOrderStatusChange(payload.data);
        break;
      }

      default:
        console.log('ℹ️ Type de webhook CJ non géré:', payload.type);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Erreur traitement webhook CJ:', error);
    // On retourne 200 pour éviter les retries
    res.status(200).json({ success: true, error: 'Erreur de traitement' });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📊 TRAITEMENT CHANGEMENT DE STATUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function handleOrderStatusChange(data: CJWebhookPayload['data']): Promise<void> {
  const { orderNum, status, trackNumber, logisticName } = data;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CHANGEMENT DE STATUT CJ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📦 Commande:', orderNum);
  console.log('📊 Nouveau statut CJ:', status);

  // Mapper le statut CJ vers le statut interne
  const internalStatus = CJ_STATUS_MAP[status.toUpperCase()] || 'cj_processing';
  console.log('📊 Statut interne:', internalStatus);

  // Récupérer la commande
  const order = await getOrderById(orderNum);
  if (!order) {
    console.log('⚠️ Commande non trouvée:', orderNum);
    return;
  }

  // Préparer les données supplémentaires
  const extraData: {
    trackingNumber?: string;
    logisticName?: string;
    trackingUrl?: string;
  } = {};

  if (trackNumber) {
    extraData.trackingNumber = trackNumber;
    extraData.trackingUrl = `https://t.17track.net/en#nums=${trackNumber}`;
    console.log('📍 Tracking:', trackNumber);
  }

  if (logisticName) {
    extraData.logisticName = logisticName;
    console.log('🚚 Transporteur:', logisticName);
  }

  // Mettre à jour le statut
  await updateOrderStatus(orderNum, internalStatus, extraData);
  console.log('✅ Statut mis à jour:', orderNum, '→', internalStatus);

  // Si expédié et tracking disponible → envoyer email
  if (status.toUpperCase() === 'SHIPPED' && trackNumber) {
    console.log('📧 Envoi email d\'expédition...');
    
    try {
      const trackingUrl = `https://t.17track.net/en#nums=${trackNumber}`;
      await sendShippingEmail(order, trackNumber, trackingUrl);
      console.log('✅ Email d\'expédition envoyé');
    } catch (error) {
      console.log('⚠️ Erreur envoi email expédition (non bloquant):', error);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

/**
 * 🔔 CoolPet - Webhook Stripe
 * 
 * Endpoint : POST /api/webhooks/stripe
 * 
 * Ce fichier gère :
 * - La vérification de signature Stripe
 * - Le traitement des paiements réussis
 * - La création automatique de commande CJ
 * - L'envoi d'email de confirmation
 * - Les remboursements
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { stripe } from '../_lib/stripe';
import { saveOrder, updateOrderStatus, getOrderByPaymentIntent, OrderItem, ShippingAddress } from '../_lib/orders';
import { createCJOrder, CJShippingAddress } from '../_lib/cj-dropshipping';
import { sendOrderConfirmationEmail } from '../_lib/email';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 CONFIGURATION VERCEL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// OBLIGATOIRE pour Vercel - désactive le body parser
export const config = {
  api: {
    bodyParser: false,
  },
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
    console.log('❌ Webhook Stripe: méthode non autorisée:', req.method);
    res.status(405).json({ error: 'Méthode non autorisée' });
    return;
  }

  console.log('🔔 Webhook Stripe reçu');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET non défini');
    res.status(500).json({ error: 'Configuration webhook manquante' });
    return;
  }

  // ─────────────────────────────────────────
  // Vérification de la signature
  // ─────────────────────────────────────────
  const signature = req.headers['stripe-signature'] as string;
  if (!signature) {
    console.log('❌ Signature Stripe manquante');
    res.status(400).json({ error: 'Signature manquante' });
    return;
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    console.log('✅ Signature Stripe valide');
    console.log('📌 Event type:', event.type);
  } catch (err) {
    const error = err as Error;
    console.log('❌ Signature Stripe invalide:', error.message);
    res.status(400).json({ error: 'Signature invalide' });
    return;
  }

  // ─────────────────────────────────────────
  // Traitement des événements
  // ─────────────────────────────────────────
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('💳 checkout.session.completed - Session:', session.id);
        await handlePaymentSuccess(session);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ payment_intent.payment_failed - PI:', paymentIntent.id);
        console.log('❌ Raison:', paymentIntent.last_payment_error?.message || 'Inconnue');
        // On ne fait rien de plus ici - le client peut réessayer
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('💸 charge.refunded - Charge:', charge.id);
        
        const paymentIntentId = charge.payment_intent as string;
        if (paymentIntentId) {
          const order = await getOrderByPaymentIntent(paymentIntentId);
          if (order) {
            await updateOrderStatus(order.id, 'refunded');
            console.log('✅ Commande marquée comme remboursée:', order.id);
          } else {
            console.log('⚠️ Aucune commande trouvée pour ce remboursement');
          }
        }
        break;
      }

      default:
        console.log('ℹ️ Événement non géré:', event.type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Erreur lors du traitement du webhook:', error);
    // On retourne quand même 200 pour éviter les retries Stripe
    res.status(200).json({ received: true, error: 'Erreur de traitement interne' });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 TRAITEMENT PAIEMENT RÉUSSI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
  // ─────────────────────────────────────────
  // ÉTAPE 1 - Logger les infos principales
  // ─────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💰 TRAITEMENT PAIEMENT RÉUSSI');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📌 Session ID:', session.id);
  console.log('📧 Email:', session.customer_details?.email);
  console.log('💶 Montant:', (session.amount_total || 0) / 100, session.currency?.toUpperCase());

  // ─────────────────────────────────────────
  // ÉTAPE 2 - Parser les items depuis metadata
  // ─────────────────────────────────────────
  let items: OrderItem[] = [];
  try {
    const itemsJson = session.metadata?.items;
    if (itemsJson) {
      items = JSON.parse(itemsJson);
      console.log('📦 Articles:', items.length);
    } else {
      console.log('⚠️ Aucun article dans les metadata');
    }
  } catch (error) {
    console.error('❌ Erreur parsing items:', error);
  }

  // ─────────────────────────────────────────
  // ÉTAPE 3 - Sauvegarder la commande
  // ─────────────────────────────────────────
  const shippingDetails = session.shipping_details;
  const shippingAddress: ShippingAddress = {
    name: shippingDetails?.name || session.customer_details?.name || 'Non spécifié',
    line1: shippingDetails?.address?.line1 || '',
    line2: shippingDetails?.address?.line2 || null,
    city: shippingDetails?.address?.city || '',
    postalCode: shippingDetails?.address?.postal_code || '',
    country: shippingDetails?.address?.country || '',
    state: shippingDetails?.address?.state || null,
  };

  const order = await saveOrder({
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent as string,
    customerEmail: session.customer_details?.email || '',
    customerName: session.customer_details?.name || 'Client',
    shippingAddress,
    items,
    totalAmount: (session.amount_total || 0) / 100,
    currency: session.currency || 'eur',
    status: 'paid',
  });

  console.log('✅ Commande sauvegardée:', order.id);

  // ─────────────────────────────────────────
  // ÉTAPE 4 - Envoyer email de confirmation
  // ─────────────────────────────────────────
  try {
    await sendOrderConfirmationEmail(order);
  } catch (error) {
    console.log('⚠️ Erreur envoi email confirmation (non bloquant):', error);
  }

  // ─────────────────────────────────────────
  // ÉTAPE 5 - Créer la commande CJ
  // ─────────────────────────────────────────
  if (items.length > 0) {
    try {
      const cjShippingAddress: CJShippingAddress = {
        name: shippingAddress.name,
        address: shippingAddress.line1,
        address2: shippingAddress.line2 || undefined,
        city: shippingAddress.city,
        zip: shippingAddress.postalCode,
        country: shippingAddress.country,
        province: shippingAddress.state || undefined,
        email: order.customerEmail,
        phone: session.customer_details?.phone || undefined,
      };

      const cjProducts = items.map((item) => ({
        vid: item.cjVariantId,
        quantity: item.quantity,
      }));

      console.log('📦 Création commande CJ...');
      
      const cjResponse = await createCJOrder({
        orderId: order.id,
        shippingAddress: cjShippingAddress,
        products: cjProducts,
      });

      // ÉTAPE 6 - CJ succès
      await updateOrderStatus(order.id, 'cj_order_created', {
        cjOrderId: cjResponse.cjOrderId,
      });
      console.log('✅ Commande CJ créée:', cjResponse.cjOrderId);
      
    } catch (error) {
      // ÉTAPE 7 - CJ échoue (ne pas faire planter le webhook)
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('❌ Échec création commande CJ:', errorMessage);
      
      await updateOrderStatus(order.id, 'cj_order_failed', {
        error: errorMessage,
      });
      
      // On continue - le webhook ne doit pas échouer
      console.log('⚠️ La commande a été payée mais la création CJ a échoué');
      console.log('⚠️ Une intervention manuelle sera nécessaire pour:', order.id);
    }
  } else {
    console.log('⚠️ Aucun article à commander chez CJ');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ TRAITEMENT PAIEMENT TERMINÉ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

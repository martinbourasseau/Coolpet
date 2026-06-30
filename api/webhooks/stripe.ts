/**
 * 🔔 CoolPet - Webhook Stripe
 * 
 * Endpoint : POST /api/webhooks/stripe
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buffer } from 'micro';
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cjProductId?: string;
  cjVariantId?: string;
}

interface ShippingAddress {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
  state: string | null;
}

interface Order {
  id: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: string;
  cjOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

const orders: Map<string, Order> = new Map();

function generateOrderId(): string {
  return `CP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

async function saveOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const id = generateOrderId();
  const now = new Date().toISOString();
  const order: Order = { ...data, id, createdAt: now, updatedAt: now };
  orders.set(id, order);
  console.log(`[ORDER SAVED] #${id} | ${data.customerEmail} | ${data.totalAmount}€`);
  return order;
}

async function updateOrderStatus(orderId: string, status: string, metadata?: Record<string, any>): Promise<void> {
  const order = orders.get(orderId);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (metadata?.cjOrderId) order.cjOrderId = metadata.cjOrderId;
    orders.set(order.id, order);
  }
  console.log(`[ORDER STATUS] ${orderId} → ${status}`);
}

async function getOrderByPaymentIntent(piId: string): Promise<Order | null> {
  for (const order of orders.values()) {
    if (order.stripePaymentIntentId === piId) return order;
  }
  return null;
}

interface CJShippingAddress {
  name: string;
  address: string;
  address2?: string;
  city: string;
  zip: string;
  country: string;
  province?: string;
  email: string;
  phone?: string;
}

interface CJProduct {
  vid: string;
  quantity: number;
}

async function createCJOrder(params: {
  orderId: string;
  shippingAddress: CJShippingAddress;
  products: CJProduct[];
}): Promise<{ cjOrderId: string; simulated: boolean }> {
  const realProducts = params.products.filter(
    (p) => p.vid && !p.vid.startsWith('PLACEHOLDER_')
  );

  if (realProducts.length === 0) {
    console.log('🧪 [DEV] Placeholders détectés → simulation CJ');
    return {
      cjOrderId: `DEV-${params.orderId}-${Date.now()}`,
      simulated: true,
    };
  }

  const cjEmail = process.env.CJ_EMAIL;
  const cjApiKey = process.env.CJ_API_KEY;

  if (!cjEmail || !cjApiKey) {
    console.log('⚠️ Variables CJ manquantes → simulation');
    return {
      cjOrderId: `DEV-${params.orderId}-${Date.now()}`,
      simulated: true,
    };
  }

  try {
    const authResponse = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cjEmail, password: cjApiKey }),
    });
    const authData = await authResponse.json();
    if (!authData.result) throw new Error(`Auth CJ: ${authData.message}`);
    const token = authData.data.accessToken;

    const orderPayload = {
      orderNumber: `COOLPET-${params.orderId}`,
      shippingZip: params.shippingAddress.zip,
      shippingCountryCode: params.shippingAddress.country,
      shippingCountry: params.shippingAddress.country,
      shippingCity: params.shippingAddress.city,
      shippingAddress: params.shippingAddress.address,
      shippingAddress2: params.shippingAddress.address2 || '',
      shippingCustomerName: params.shippingAddress.name,
      shippingPhone: params.shippingAddress.phone || '',
      remark: `CoolPet #${params.orderId}`,
      fromCountryCode: 'CN',
      logisticName: 'CJPacket Ordinary',
      products: realProducts,
    };

    const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': token,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();
    if (!data.result) throw new Error(`CJ createOrder: ${data.message}`);

    return {
      cjOrderId: data.data?.orderId || `CJ-${Date.now()}`,
      simulated: false,
    };
  } catch (error: any) {
    console.error('❌ Erreur CJ (fallback simulation):', error.message);
    return {
      cjOrderId: `ERR-${params.orderId}-${Date.now()}`,
      simulated: true,
    };
  }
}

async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  console.log(`📧 [EMAIL SIMULÉ] Confirmation pour ${order.customerEmail}`);
  console.log(`   Commande: ${order.id}`);
  console.log(`   Total: ${order.totalAmount}€`);
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non autorisée' });
    return;
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET manquant');
    res.status(500).json({ error: 'Configuration webhook manquante' });
    return;
  }

  const signature = req.headers['stripe-signature'] as string;
  if (!signature) {
    res.status(400).json({ error: 'Signature manquante' });
    return;
  }

  let event: Stripe.Event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    console.log('✅ Webhook Stripe valide:', event.type);
  } catch (err: any) {
    console.error('❌ Signature invalide:', err.message);
    res.status(400).json({ error: 'Signature invalide' });
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handlePaymentSuccess(session);
        break;
      }
      case 'payment_intent.payment_failed':
        console.log('❌ Paiement échoué');
        break;
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const piId = charge.payment_intent as string;
        if (piId) {
          const order = await getOrderByPaymentIntent(piId);
          if (order) await updateOrderStatus(order.id, 'refunded');
        }
        break;
      }
      default:
        console.log('ℹ️ Event ignoré:', event.type);
    }
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    res.status(200).json({ received: true, error: 'Erreur interne' });
  }
}

async function handlePaymentSuccess(session: Stripe.Checkout.Session): Promise<void> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💰 PAIEMENT RÉUSSI:', session.id);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let items: OrderItem[] = [];
  try {
    const itemsJson = session.metadata?.items;
    if (itemsJson) items = JSON.parse(itemsJson);
  } catch (e) {
    console.error('❌ Erreur parsing items:', e);
  }

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

  try {
    await sendOrderConfirmationEmail(order);
  } catch (e) {
    console.log('⚠️ Email non envoyé');
  }

  if (items.length > 0) {
    try {
      const cjProducts = items.map((item) => ({
        vid: item.cjVariantId || '',
        quantity: item.quantity,
      }));

      const cjResponse = await createCJOrder({
        orderId: order.id,
        shippingAddress: {
          name: shippingAddress.name,
          address: shippingAddress.line1,
          address2: shippingAddress.line2 || undefined,
          city: shippingAddress.city,
          zip: shippingAddress.postalCode,
          country: shippingAddress.country,
          province: shippingAddress.state || undefined,
          email: order.customerEmail,
          phone: session.customer_details?.phone || undefined,
        },
        products: cjProducts,
      });

      if (cjResponse.simulated) {
        await updateOrderStatus(order.id, 'cj_simulated');
        console.log('🧪 Commande CJ simulée');
      } else {
        await updateOrderStatus(order.id, 'cj_order_created', {
          cjOrderId: cjResponse.cjOrderId,
        });
        console.log('✅ Commande CJ créée:', cjResponse.cjOrderId);
      }
    } catch (e: any) {
      console.error('❌ Erreur CJ:', e.message);
      await updateOrderStatus(order.id, 'cj_order_failed', { error: e.message });
    }
  }

  console.log('✅ TRAITEMENT TERMINÉ');
}
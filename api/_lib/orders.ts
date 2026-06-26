/**
 * 📋 CoolPet - Gestion des Commandes
 * 
 * Ce fichier contient :
 * - Les types pour les commandes
 * - La génération d'ID de commande
 * - Les opérations CRUD avec Upstash Redis
 * - Les index pour recherche rapide
 */

import { Redis } from '@upstash/redis';

// Initialisation Upstash Redis (remplace Vercel KV)
const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 TYPES EXPORTÉS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type OrderStatus =
  | 'paid'
  | 'cj_order_created'
  | 'cj_order_failed'
  | 'cj_processing'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'payment_failed';

export interface ShippingAddress {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string;
  country: string;
  state: string | null;
}

export interface OrderItem {
  cjProductId: string;
  cjVariantId: string;
  quantity: number;
  name: string;
}

export interface Order {
  id: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  cjOrderId?: string;
  trackingNumber?: string;
  logisticName?: string;
  trackingUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveOrderData {
  stripeSessionId: string;
  stripePaymentIntentId: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔢 GÉNÉRATION D'ID DE COMMANDE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function generateOrderId(): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclut 0, O, I, 1 pour éviter confusion
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const orderId = `CP-${year}${month}${day}-${random}`;
  console.log('🔢 Génération ID commande:', orderId);
  return orderId;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💾 SAUVEGARDE DE COMMANDE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function saveOrder(data: SaveOrderData): Promise<Order> {
  const orderId = generateOrderId();
  const now = new Date().toISOString();
  
  const order: Order = {
    id: orderId,
    stripeSessionId: data.stripeSessionId,
    stripePaymentIntentId: data.stripePaymentIntentId,
    customerEmail: data.customerEmail,
    customerName: data.customerName,
    shippingAddress: data.shippingAddress,
    items: data.items,
    totalAmount: data.totalAmount,
    currency: data.currency,
    status: data.status,
    createdAt: now,
    updatedAt: now,
  };

  console.log('💾 Sauvegarde commande:', orderId);
  console.log('💾 Client:', data.customerEmail);
  console.log('💾 Montant:', data.totalAmount, data.currency.toUpperCase());

  try {
    // Sauvegarde principale de la commande
    await kv.set(`order:${orderId}`, order);
    
    // Index par session Stripe
    await kv.set(`stripe:session:${data.stripeSessionId}`, orderId);
    
    // Index par Payment Intent
    await kv.set(`stripe:pi:${data.stripePaymentIntentId}`, orderId);
    
    // Index par email client (liste des commandes)
    const emailKey = `customer:${data.customerEmail.toLowerCase()}`;
    const existingOrders = await kv.get<string[]>(emailKey) || [];
    await kv.set(emailKey, [...existingOrders, orderId]);
    
    // Liste globale des commandes (pour admin)
    await kv.lpush('orders:all', orderId);
    
    console.log('✅ Commande sauvegardée avec succès:', orderId);
    
    return order;
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de la commande:', error);
    throw error;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 RÉCUPÉRATION DE COMMANDE PAR ID
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getOrderById(orderId: string): Promise<Order | null> {
  console.log('🔍 Recherche commande par ID:', orderId);
  
  try {
    const order = await kv.get<Order>(`order:${orderId}`);
    
    if (!order) {
      console.log('⚠️ Commande non trouvée:', orderId);
      return null;
    }
    
    console.log('✅ Commande trouvée:', orderId, '- Status:', order.status);
    return order;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la commande:', error);
    throw error;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 RÉCUPÉRATION PAR SESSION STRIPE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getOrderByStripeSession(sessionId: string): Promise<Order | null> {
  console.log('🔍 Recherche commande par session Stripe:', sessionId);
  
  try {
    const orderId = await kv.get<string>(`stripe:session:${sessionId}`);
    
    if (!orderId) {
      console.log('⚠️ Aucune commande trouvée pour cette session');
      return null;
    }
    
    return await getOrderById(orderId);
  } catch (error) {
    console.error('❌ Erreur lors de la recherche par session:', error);
    throw error;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 RÉCUPÉRATION PAR PAYMENT INTENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | null> {
  console.log('🔍 Recherche commande par Payment Intent:', paymentIntentId);
  
  try {
    const orderId = await kv.get<string>(`stripe:pi:${paymentIntentId}`);
    
    if (!orderId) {
      console.log('⚠️ Aucune commande trouvée pour ce Payment Intent');
      return null;
    }
    
    return await getOrderById(orderId);
  } catch (error) {
    console.error('❌ Erreur lors de la recherche par Payment Intent:', error);
    throw error;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔄 MISE À JOUR DU STATUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface UpdateOrderData {
  cjOrderId?: string;
  trackingNumber?: string;
  logisticName?: string;
  trackingUrl?: string;
  error?: string;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  extraData?: UpdateOrderData
): Promise<Order | null> {
  console.log('🔄 Mise à jour statut commande:', orderId, '→', status);
  
  try {
    const order = await getOrderById(orderId);
    
    if (!order) {
      console.log('❌ Impossible de mettre à jour: commande non trouvée');
      return null;
    }
    
    const updatedOrder: Order = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
      ...(extraData || {}),
    };
    
    await kv.set(`order:${orderId}`, updatedOrder);
    
    console.log('✅ Statut mis à jour:', orderId, '→', status);
    
    if (extraData?.cjOrderId) {
      console.log('📦 CJ Order ID:', extraData.cjOrderId);
    }
    if (extraData?.trackingNumber) {
      console.log('📍 Tracking:', extraData.trackingNumber);
    }
    
    return updatedOrder;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut:', error);
    throw error;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📧 COMMANDES PAR EMAIL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  console.log('📧 Recherche commandes pour:', email);
  
  try {
    const emailKey = `customer:${email.toLowerCase()}`;
    const orderIds = await kv.get<string[]>(emailKey);
    
    if (!orderIds || orderIds.length === 0) {
      console.log('⚠️ Aucune commande trouvée pour cet email');
      return [];
    }
    
    console.log('📧 Nombre de commandes trouvées:', orderIds.length);
    
    // Charger toutes les commandes
    const orders: Order[] = [];
    for (const orderId of orderIds) {
      const order = await getOrderById(orderId);
      if (order) {
        orders.push(order);
      }
    }
    
    // Trier par date décroissante
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return orders;
  } catch (error) {
    console.error('❌ Erreur lors de la recherche par email:', error);
    throw error;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📋 COMMANDES RÉCENTES (ADMIN)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getRecentOrders(limit: number = 20): Promise<Order[]> {
  console.log('📋 Récupération des', limit, 'commandes récentes');
  
  try {
    const orderIds = await kv.lrange<string>('orders:all', 0, limit - 1);
    
    if (!orderIds || orderIds.length === 0) {
      console.log('⚠️ Aucune commande trouvée');
      return [];
    }
    
    const orders: Order[] = [];
    for (const orderId of orderIds) {
      const order = await getOrderById(orderId);
      if (order) {
        orders.push(order);
      }
    }
    
    console.log('✅ Commandes récupérées:', orders.length);
    
    return orders;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des commandes récentes:', error);
    throw error;
  }
}
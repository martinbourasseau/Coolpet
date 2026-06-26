/**
 * 🚚 CoolPet - Intégration CJ Dropshipping
 * 
 * Ce fichier contient :
 * - L'authentification avec cache du token
 * - La création de commandes CJ
 * - Le suivi des colis
 * - La récupération des infos produits
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CJ_BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';

// Cache du token d'accès
let cachedToken: string | null = null;
let tokenExpiry: Date | null = null;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 TYPES EXPORTÉS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CJShippingAddress {
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

export interface CJOrderProduct {
  vid: string;
  quantity: number;
}

export interface CJOrderRequest {
  orderId: string;
  shippingAddress: CJShippingAddress;
  products: CJOrderProduct[];
}

export interface CJOrderResponse {
  cjOrderId: string;
  status: string;
}

export interface CJTrackingInfo {
  orderStatus: string;
  trackingNumber: string | null;
  logisticName: string | null;
  trackingUrl: string | null;
}

interface CJAPIResponse<T> {
  code: number;
  result: boolean;
  message: string;
  data: T;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔑 AUTHENTIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function getAccessToken(): Promise<string> {
  // Vérifier si le token en cache est encore valide (avec 5 min de marge)
  if (cachedToken && tokenExpiry && new Date() < new Date(tokenExpiry.getTime() - 5 * 60 * 1000)) {
    console.log('✅ CJ: Utilisation du token en cache');
    return cachedToken;
  }

  const email = process.env.CJ_EMAIL;
  const apiKey = process.env.CJ_API_KEY;

  if (!email || !apiKey) {
    throw new Error('❌ CJ_EMAIL ou CJ_API_KEY manquant dans les variables d\'environnement');
  }

  console.log('🔑 CJ: Demande d\'un nouveau token...');

  try {
    const response = await fetch(`${CJ_BASE_URL}/authentication/getAccessToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: apiKey,
      }),
    });

    const data: CJAPIResponse<{ accessToken: string; accessTokenExpiryDate: string }> = await response.json();

    if (!data.result || !data.data?.accessToken) {
      console.log('❌ CJ: Échec authentification -', data.message);
      throw new Error(`CJ Authentication failed: ${data.message}`);
    }

    cachedToken = data.data.accessToken;
    tokenExpiry = new Date(data.data.accessTokenExpiryDate);

    console.log('✅ CJ: Nouveau token obtenu, expire le', tokenExpiry.toISOString());

    return cachedToken;
  } catch (error) {
    console.error('❌ CJ: Erreur lors de l\'authentification:', error);
    throw error;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 CRÉATION DE COMMANDE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function createCJOrder(orderData: CJOrderRequest): Promise<CJOrderResponse> {
  const token = await getAccessToken();

  console.log('📦 CJ: Création de commande', orderData.orderId);
  console.log('📦 CJ: Adresse de livraison:', orderData.shippingAddress.city, orderData.shippingAddress.country);
  console.log('📦 CJ: Produits:', orderData.products.length, 'article(s)');

  const payload = {
    orderNumber: orderData.orderId,
    shippingZip: orderData.shippingAddress.zip,
    shippingCountryCode: orderData.shippingAddress.country,
    shippingCountry: orderData.shippingAddress.country,
    shippingProvince: orderData.shippingAddress.province || '',
    shippingCity: orderData.shippingAddress.city,
    shippingAddress: orderData.shippingAddress.address,
    shippingAddress2: orderData.shippingAddress.address2 || '',
    shippingCustomerName: orderData.shippingAddress.name,
    shippingPhone: orderData.shippingAddress.phone || '',
    shippingEmail: orderData.shippingAddress.email,
    remark: 'CoolPet Store — Commande automatique',
    logisticName: 'CJPacket Ordinary',
    fromCountryCode: 'CN',
    products: orderData.products.map((p) => ({
      vid: p.vid,
      quantity: p.quantity,
    })),
  };

  try {
    const response = await fetch(`${CJ_BASE_URL}/shopping/order/createOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': token,
      },
      body: JSON.stringify(payload),
    });

    const data: CJAPIResponse<{ orderId: string; orderNum: string }> = await response.json();

    if (!data.result) {
      console.log('❌ CJ: Échec création commande -', data.message);
      throw new Error(`CJ Order creation failed: ${data.message}`);
    }

    console.log('✅ CJ: Commande créée avec succès - CJ Order ID:', data.data.orderId);

    return {
      cjOrderId: data.data.orderId,
      status: 'CREATED',
    };
  } catch (error) {
    console.error('❌ CJ: Erreur lors de la création de commande:', error);
    throw error;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📍 SUIVI DE COMMANDE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function getCJTracking(cjOrderId: string): Promise<CJTrackingInfo> {
  const token = await getAccessToken();

  console.log('📍 CJ: Récupération du suivi pour', cjOrderId);

  try {
    const response = await fetch(`${CJ_BASE_URL}/shopping/order/getOrderDetail?orderId=${cjOrderId}`, {
      method: 'GET',
      headers: {
        'CJ-Access-Token': token,
      },
    });

    const data: CJAPIResponse<{
      orderStatus: string;
      trackNumber: string | null;
      logisticName: string | null;
    }> = await response.json();

    if (!data.result) {
      console.log('❌ CJ: Échec récupération suivi -', data.message);
      throw new Error(`CJ Tracking fetch failed: ${data.message}`);
    }

    const trackingNumber = data.data.trackNumber;
    const trackingUrl = trackingNumber 
      ? `https://t.17track.net/en#nums=${trackingNumber}` 
      : null;

    console.log('✅ CJ: Suivi récupéré - Status:', data.data.orderStatus, '- Tracking:', trackingNumber || 'N/A');

    return {
      orderStatus: data.data.orderStatus,
      trackingNumber: trackingNumber,
      logisticName: data.data.logisticName,
      trackingUrl: trackingUrl,
    };
  } catch (error) {
    console.error('❌ CJ: Erreur lors de la récupération du suivi:', error);
    throw error;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏷️ INFOS PRODUIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CJProductInfo {
  vid: string;
  variantName: string;
  variantSku: string;
  variantImage: string;
  sellPrice: number;
}

export async function getCJProductInfo(vid: string): Promise<CJProductInfo | null> {
  const token = await getAccessToken();

  console.log('🏷️ CJ: Récupération infos produit pour vid:', vid);

  try {
    const response = await fetch(`${CJ_BASE_URL}/product/variant/queryByVid?vid=${vid}`, {
      method: 'GET',
      headers: {
        'CJ-Access-Token': token,
      },
    });

    const data: CJAPIResponse<CJProductInfo> = await response.json();

    if (!data.result || !data.data) {
      console.log('⚠️ CJ: Produit non trouvé pour vid:', vid);
      return null;
    }

    console.log('✅ CJ: Infos produit récupérées -', data.data.variantName);

    return data.data;
  } catch (error) {
    console.error('❌ CJ: Erreur lors de la récupération des infos produit:', error);
    return null;
  }
}

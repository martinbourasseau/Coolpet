/**
 * 📧 CoolPet - Gestion des Emails
 * 
 * Ce fichier contient :
 * - L'envoi d'email de confirmation de commande
 * - L'envoi d'email de notification d'expédition
 * - Templates HTML professionnels
 */

import { Order } from './orders';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'commandes@coolpet.store';
const SUPPORT_EMAIL = 'support@coolpet.store';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📧 EMAIL DE CONFIRMATION DE COMMANDE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY non définie - email de confirmation non envoyé');
    return;
  }

  console.log('📧 Envoi email de confirmation pour commande:', order.id);

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; font-family: Arial, sans-serif;">
          ${item.name}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-family: Arial, sans-serif;">
          ${item.quantity}
        </td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de commande - CoolPet</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-family: Arial, sans-serif;">
                🐾 CoolPet
              </h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">
                Accessoires rafraîchissants pour animaux
              </p>
            </td>
          </tr>
          
          <!-- Confirmation Banner -->
          <tr>
            <td style="background-color: #10b981; padding: 20px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-family: Arial, sans-serif;">
                ✅ Commande confirmée !
              </h2>
            </td>
          </tr>
          
          <!-- Order Info -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; margin: 0 0 20px 0;">
                Bonjour <strong>${order.customerName}</strong>,
              </p>
              <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; margin: 0 0 20px 0;">
                Merci pour votre commande ! Nous avons bien reçu votre paiement et votre commande est en cours de préparation.
              </p>
              
              <!-- Order Number -->
              <div style="background-color: #f0f9ff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="font-family: Arial, sans-serif; font-size: 14px; color: #666; margin: 0;">
                  Numéro de commande
                </p>
                <p style="font-family: Arial, sans-serif; font-size: 24px; color: #2563eb; font-weight: bold; margin: 10px 0 0 0;">
                  ${order.id}
                </p>
              </div>
              
              <!-- Items Table -->
              <h3 style="font-family: Arial, sans-serif; font-size: 18px; color: #333; margin: 30px 0 15px 0;">
                📦 Articles commandés
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <tr style="background-color: #f8f8f8;">
                  <th style="padding: 12px; text-align: left; font-family: Arial, sans-serif; font-size: 14px; color: #666;">Article</th>
                  <th style="padding: 12px; text-align: center; font-family: Arial, sans-serif; font-size: 14px; color: #666;">Qté</th>
                </tr>
                ${itemsHtml}
              </table>
              
              <!-- Total -->
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: right;">
                <p style="font-family: Arial, sans-serif; font-size: 18px; color: #333; margin: 0;">
                  <strong>Total : ${order.totalAmount.toFixed(2)} €</strong>
                </p>
              </div>
              
              <!-- Shipping Address -->
              <h3 style="font-family: Arial, sans-serif; font-size: 18px; color: #333; margin: 30px 0 15px 0;">
                📍 Adresse de livraison
              </h3>
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 15px;">
                <p style="font-family: Arial, sans-serif; font-size: 14px; color: #333; margin: 0; line-height: 1.6;">
                  ${order.shippingAddress.name}<br>
                  ${order.shippingAddress.line1}<br>
                  ${order.shippingAddress.line2 ? order.shippingAddress.line2 + '<br>' : ''}
                  ${order.shippingAddress.postalCode} ${order.shippingAddress.city}<br>
                  ${order.shippingAddress.state ? order.shippingAddress.state + ', ' : ''}${order.shippingAddress.country}
                </p>
              </div>
              
              <!-- Delivery Info -->
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="font-family: Arial, sans-serif; font-size: 14px; color: #92400e; margin: 0;">
                  ⏱️ <strong>Délai de livraison estimé :</strong> 7-15 jours ouvrés
                </p>
                <p style="font-family: Arial, sans-serif; font-size: 12px; color: #92400e; margin: 10px 0 0 0;">
                  Vous recevrez un email avec le numéro de suivi dès l'expédition de votre colis.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="font-family: Arial, sans-serif; font-size: 14px; color: #666; margin: 0 0 10px 0;">
                Une question ? Contactez-nous :
              </p>
              <p style="font-family: Arial, sans-serif; font-size: 14px; margin: 0;">
                <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb; text-decoration: none;">
                  ${SUPPORT_EMAIL}
                </a>
              </p>
              <p style="font-family: Arial, sans-serif; font-size: 12px; color: #999; margin: 20px 0 0 0;">
                © ${new Date().getFullYear()} CoolPet - Tous droits réservés
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: order.customerEmail,
        subject: `✅ Commande ${order.id} confirmée - CoolPet`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('⚠️ Erreur envoi email (non bloquant):', errorData);
      return;
    }

    console.log('✅ Email de confirmation envoyé à:', order.customerEmail);
  } catch (error) {
    console.log('⚠️ Erreur envoi email de confirmation (non bloquant):', error);
    // Ne pas faire planter le webhook
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📧 EMAIL DE NOTIFICATION D'EXPÉDITION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function sendShippingEmail(
  order: Order,
  trackingNumber: string,
  trackingUrl: string
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log('⚠️ RESEND_API_KEY non définie - email d\'expédition non envoyé');
    return;
  }

  console.log('📧 Envoi email d\'expédition pour commande:', order.id);

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre colis est en route ! - CoolPet</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #2563eb; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-family: Arial, sans-serif;">
                🐾 CoolPet
              </h1>
            </td>
          </tr>
          
          <!-- Shipping Banner -->
          <tr>
            <td style="background-color: #8b5cf6; padding: 30px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 26px; font-family: Arial, sans-serif;">
                🚀 Votre colis est en route !
              </h2>
              <p style="color: #ffffff; margin: 15px 0 0 0; font-size: 16px; opacity: 0.9;">
                Commande ${order.id}
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; margin: 0 0 20px 0;">
                Bonjour <strong>${order.customerName}</strong>,
              </p>
              <p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; margin: 0 0 30px 0;">
                Bonne nouvelle ! Votre commande a été expédiée et est en chemin vers vous. 📦
              </p>
              
              <!-- Tracking Number -->
              <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 25px; text-align: center; margin: 20px 0;">
                <p style="font-family: Arial, sans-serif; font-size: 14px; color: #666; margin: 0;">
                  Numéro de suivi
                </p>
                <p style="font-family: Arial, sans-serif; font-size: 28px; color: #10b981; font-weight: bold; margin: 15px 0; letter-spacing: 2px;">
                  ${trackingNumber}
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${trackingUrl}" 
                   style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 15px 40px; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px; font-family: Arial, sans-serif;">
                  📍 Suivre mon colis
                </a>
              </div>
              
              <!-- Delivery Info -->
              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="font-family: Arial, sans-serif; font-size: 16px; color: #333; margin: 0 0 15px 0;">
                  📍 Livraison prévue à :
                </h3>
                <p style="font-family: Arial, sans-serif; font-size: 14px; color: #666; margin: 0; line-height: 1.6;">
                  ${order.shippingAddress.name}<br>
                  ${order.shippingAddress.line1}<br>
                  ${order.shippingAddress.line2 ? order.shippingAddress.line2 + '<br>' : ''}
                  ${order.shippingAddress.postalCode} ${order.shippingAddress.city}<br>
                  ${order.shippingAddress.country}
                </p>
              </div>
              
              <p style="font-family: Arial, sans-serif; font-size: 14px; color: #666; margin: 30px 0 0 0;">
                Le suivi peut prendre 24-48h pour être activé après l'expédition.
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f8f8; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="font-family: Arial, sans-serif; font-size: 14px; color: #666; margin: 0 0 10px 0;">
                Une question ? Contactez-nous :
              </p>
              <p style="font-family: Arial, sans-serif; font-size: 14px; margin: 0;">
                <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb; text-decoration: none;">
                  ${SUPPORT_EMAIL}
                </a>
              </p>
              <p style="font-family: Arial, sans-serif; font-size: 12px; color: #999; margin: 20px 0 0 0;">
                © ${new Date().getFullYear()} CoolPet - Tous droits réservés
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: order.customerEmail,
        subject: `🚀 Votre colis CoolPet est en route ! - ${order.id}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('⚠️ Erreur envoi email expédition (non bloquant):', errorData);
      return;
    }

    console.log('✅ Email d\'expédition envoyé à:', order.customerEmail);
  } catch (error) {
    console.log('⚠️ Erreur envoi email d\'expédition (non bloquant):', error);
    // Ne pas faire planter le webhook
  }
}

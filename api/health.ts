/**
 * 🏥 CoolPet - Health Check
 * 
 * Endpoint : GET /api/health
 * 
 * Ce fichier vérifie :
 * - La présence de toutes les variables d'environnement
 * - Le statut global du système
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 HANDLER PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  console.log('🏥 Health check demandé');

  // ─────────────────────────────────────────
  // Vérification des variables d'environnement
  // ─────────────────────────────────────────
  const checks = {
    // Stripe
    stripe_secret: !!process.env.STRIPE_SECRET_KEY,
    stripe_webhook: !!process.env.STRIPE_WEBHOOK_SECRET,
    stripe_public: !!process.env.VITE_STRIPE_PUBLIC_KEY,
    
    // CJ Dropshipping
    cj_email: !!process.env.CJ_EMAIL,
    cj_api_key: !!process.env.CJ_API_KEY,
    
    // Frontend
    frontend_url: process.env.FRONTEND_URL || '❌ non défini',
    
    // Vercel KV
    kv_url: !!process.env.KV_REST_API_URL,
    kv_token: !!process.env.KV_REST_API_TOKEN,
    
    // Email
    resend: !!process.env.RESEND_API_KEY,
  };

  // ─────────────────────────────────────────
  // Déterminer le statut global
  // ─────────────────────────────────────────
  const criticalOk = 
    checks.stripe_secret && 
    checks.stripe_webhook && 
    checks.cj_email && 
    checks.cj_api_key && 
    checks.kv_url && 
    checks.kv_token;

  const status = criticalOk 
    ? '✅ Opérationnel' 
    : '⚠️ Configuration incomplète';

  const httpStatus = criticalOk ? 200 : 503;

  // ─────────────────────────────────────────
  // Logger les résultats
  // ─────────────────────────────────────────
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏥 HEALTH CHECK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Stripe Secret:', checks.stripe_secret ? '✅' : '❌');
  console.log('Stripe Webhook:', checks.stripe_webhook ? '✅' : '❌');
  console.log('Stripe Public:', checks.stripe_public ? '✅' : '❌');
  console.log('CJ Email:', checks.cj_email ? '✅' : '❌');
  console.log('CJ API Key:', checks.cj_api_key ? '✅' : '❌');
  console.log('Frontend URL:', typeof checks.frontend_url === 'string' && checks.frontend_url.startsWith('http') ? '✅' : '⚠️');
  console.log('KV URL:', checks.kv_url ? '✅' : '❌');
  console.log('KV Token:', checks.kv_token ? '✅' : '❌');
  console.log('Resend:', checks.resend ? '✅' : '⚠️ (optionnel)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Status:', status);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // ─────────────────────────────────────────
  // Réponse
  // ─────────────────────────────────────────
  res.status(httpStatus).json({
    status: status,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      stripe_secret: checks.stripe_secret ? '✅' : '❌',
      stripe_webhook: checks.stripe_webhook ? '✅' : '❌',
      stripe_public: checks.stripe_public ? '✅' : '⚠️',
      cj_email: checks.cj_email ? '✅' : '❌',
      cj_api_key: checks.cj_api_key ? '✅' : '❌',
      frontend_url: typeof checks.frontend_url === 'string' && checks.frontend_url.startsWith('http') 
        ? '✅' 
        : checks.frontend_url,
      kv_url: checks.kv_url ? '✅' : '❌',
      kv_token: checks.kv_token ? '✅' : '❌',
      resend: checks.resend ? '✅' : '⚠️ optionnel',
    },
    critical: {
      all_required_present: criticalOk,
      missing: Object.entries(checks)
        .filter(([key, value]) => {
          if (key === 'resend' || key === 'stripe_public') return false; // Optionnels
          if (key === 'frontend_url') return typeof value !== 'string' || !value.startsWith('http');
          return !value;
        })
        .map(([key]) => key),
    },
  });
}

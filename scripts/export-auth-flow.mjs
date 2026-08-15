/**
 * Export auth + onboarding + core app screens as numbered PNGs + HTML gallery.
 * Usage: node scripts/export-auth-flow.mjs http://127.0.0.1:8081
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require('/tmp/pw-catdex/node_modules/playwright'));
}

const OUT_DIR = path.join(__dirname, '..', 'screenshots', 'flow-export');
const BASE = (process.argv[2] || 'http://127.0.0.1:8081').replace(/\/$/, '');
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2 };

const results = [];

async function wait(page, ms = 1500) {
  await page.waitForLoadState('domcontentloaded').catch(() => undefined);
  await page.waitForTimeout(ms);
}

async function shot(page, id, title, route = '') {
  const file = path.join(OUT_DIR, `${id}.png`);
  await page.setViewportSize({ width: VIEWPORT.width, height: VIEWPORT.height });
  await page.waitForTimeout(300);
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
  results.push({ id, title, route, file: path.basename(file) });
  console.log(`✓ ${id} — ${title}`);
  return file;
}

async function goto(page, route) {
  console.log(`→ ${route}`);
  await page.goto(`${BASE}${route}`, { waitUntil: 'commit', timeout: 90_000 });
  await wait(page, 2000);
}

async function clickButton(page, name, waitMs = 1800) {
  const btn = page.getByRole('button', { name: new RegExp(name, 'i') }).first();
  await btn.waitFor({ state: 'visible', timeout: 20_000 });
  await btn.click({ force: true, timeout: 15_000 });
  await wait(page, waitMs);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: VIEWPORT.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  // —— Public auth ——
  await goto(page, '/welcome');
  await shot(page, '01-welcome', 'Welcome · entrée', '/welcome');

  await goto(page, '/login');
  await shot(page, '02-login', 'Connexion', '/login');

  await goto(page, '/signup');
  await shot(page, '03-signup-empty', 'Inscription · formulaire vide', '/signup');

  const email = `flow_${Date.now()}@catdex.app`;
  const password = 'CatDexDemo1!';
  const inputs = page.locator('input');
  await inputs.nth(0).fill('FlowDemo');
  await inputs.nth(1).fill(email);
  await inputs.nth(2).fill(password);
  await inputs.nth(3).fill(password);
  await wait(page, 500);
  await shot(page, '03b-signup-filled', 'Inscription · formulaire rempli', '/signup');

  await clickButton(page, 'Créer mon compte', 3500);

  // —— Onboarding trilogy ——
  // Land on intro (or navigate)
  if (!page.url().includes('intro')) {
    await goto(page, '/intro');
  }
  await wait(page, 1000);
  await shot(page, '04-intro', 'Onboarding 1/3 · Apparition + types de chats', '/intro');

  await clickButton(page, 'Partir explorer', 2200);
  if (!page.url().includes('permissions')) {
    await goto(page, '/permissions');
  }
  await wait(page, 2200);
  await shot(page, '05-scan', 'Onboarding 2/3 · Analyse IA', '/permissions');

  await clickButton(page, 'Trouver mon premier chat', 2200);
  if (!page.url().includes('onboarding-reward')) {
    await goto(page, '/onboarding-reward');
  }
  await wait(page, 1200);
  await shot(page, '06-reward', 'Onboarding 3/3 · Premier chat', '/onboarding-reward');

  await clickButton(page, 'Commencer ma collection', 2800);

  // PWA sheet (may be absent on desktop headless)
  if (await page.getByText(/Accès rapide CatDex/i).count()) {
    await shot(page, '06b-pwa-home', 'Post-onboarding · Ajouter à l’écran d’accueil', '/onboarding-reward');
    await clickButton(page, 'Plus tard|Continuer vers la carte|Continuer', 1500).catch(async () => {
      await clickButton(page, 'Continuer', 1500);
    });
  }

  // Support / Revolut modal
  if (await page.getByText(/CatDex est gratuit|Soutenir via Revolut/i).count()) {
    await wait(page, 400);
    await shot(page, '06c-support', 'Post-onboarding · Projet gratuit / Revolut', '/onboarding-reward');
    await clickButton(page, 'Continuer', 2800);
  } else {
    console.warn('! Support modal not visible — retrying CTA path');
  }

  // —— Core app (same session) ——
  const appScreens = [
    { id: '07-map', route: '/map', title: 'Explorer · carte' },
    { id: '08-catdex', route: '/catdex', title: 'CatDex · collection' },
    { id: '09-missions', route: '/missions', title: 'Missions' },
    { id: '10-profile', route: '/profile', title: 'Profil (+ Soutenir via Revolut)' },
    { id: '11-scanner', route: '/scanner', title: 'Scanner' },
    { id: '12-discovery', route: '/discovery', title: 'Discovery' },
    { id: '13-settings', route: '/settings', title: 'Réglages' },
    { id: '14-settings-profile', route: '/settings/edit-profile', title: 'Réglages · Éditer profil' },
    { id: '15-settings-help', route: '/settings/help', title: 'Réglages · Aide' },
  ];

  for (const screen of appScreens) {
    await goto(page, screen.route);
    // Skip if bounced to welcome/intro
    const bounced =
      page.url().includes('welcome') ||
      (page.url().includes('intro') && screen.route !== '/intro') ||
      (await page.getByText(/Partir explorer/i).count());
    if (bounced && !screen.route.includes('intro')) {
      console.warn(`! ${screen.id} bounced — session/onboarding gate`);
    }
    await shot(page, screen.id, screen.title, screen.route);
  }

  await browser.close();

  const cards = results
    .map(
      (r) => `
    <figure>
      <img src="${r.file}" alt="${r.title}" />
      <figcaption><strong>${r.id}</strong> — ${r.title}<br/><code>${r.route || ''}</code></figcaption>
    </figure>`,
    )
    .join('\n');

  fs.writeFileSync(
    path.join(OUT_DIR, 'index.html'),
    `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CatDex — Flow screenshots</title>
  <style>
    body { margin: 0; padding: 24px; background: #F2F2F2; font-family: system-ui, sans-serif; }
    h1 { margin: 0 0 8px; }
    p { color: #667085; margin: 0 0 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    figure { margin: 0; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(17,24,39,.08); }
    img { display: block; width: 100%; height: auto; background: #EEF0F2; }
    figcaption { padding: 12px 14px 16px; font-size: 13px; line-height: 1.4; }
    code { font-size: 12px; color: #6A69F8; }
  </style>
</head>
<body>
  <h1>CatDex — auth & onboarding flow</h1>
  <p>${results.length} écrans · ${VIEWPORT.width}×${VIEWPORT.height} @${VIEWPORT.deviceScaleFactor}x · ${new Date().toISOString()}</p>
  <div class="grid">${cards}</div>
</body>
</html>`,
    'utf8',
  );

  fs.writeFileSync(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify({ base: BASE, generatedAt: new Date().toISOString(), screens: results }, null, 2),
  );

  console.log(`\n✅ ${results.length} screenshots → screenshots/flow-export/`);
  console.log('🖼  Open screenshots/flow-export/index.html');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

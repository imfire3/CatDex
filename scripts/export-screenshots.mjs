/**
 * Export every CatDex screen as mobile screenshots + HTML gallery.
 *
 * 1) Captures public auth screens
 * 2) Creates a mock account via the signup UI (needs Expo mock-auth server)
 * 3) Completes onboarding, then captures the rest of the app in-session
 *
 *   EXPO_NO_DOTENV=1 EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key npx expo start --web --port 8099
 *   node scripts/export-screenshots.mjs http://127.0.0.1:8099
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

const OUT_DIR = path.join(__dirname, '..', 'screenshots', 'app');
const GALLERY = path.join(__dirname, '..', 'screenshots', 'index.html');
const BASE = (process.argv[2] || process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:8099').replace(
  /\/$/,
  '',
);

const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2 };

const PUBLIC_SCREENS = [
  { id: '01-welcome', route: '/welcome', title: 'Welcome' },
  { id: '02-login', route: '/login', title: 'Connexion' },
  { id: '03-signup', route: '/signup', title: 'Inscription' },
];

const APP_SCREENS = [
  { id: '04-intro', route: '/intro', title: 'Intro', beforeOnboarding: true },
  { id: '05-permissions', route: '/permissions', title: 'Permissions', beforeOnboarding: true },
  { id: '06-map', route: '/map', title: 'Explorer (carte)' },
  { id: '07-catdex', route: '/catdex', title: 'CatDex' },
  { id: '08-missions', route: '/missions', title: 'Missions' },
  { id: '09-profile', route: '/profile', title: 'Profil' },
  { id: '10-scanner', route: '/scanner', title: 'Scanner / Capture' },
  { id: '11-discovery', route: '/discovery', title: 'Discovery' },
  { id: '12-settings-profile', route: '/settings/edit-profile', title: 'Réglages · Profil' },
  { id: '13-settings-notifications', route: '/settings/notifications', title: 'Réglages · Notifs' },
  { id: '14-settings-help', route: '/settings/help', title: 'Réglages · Aide' },
  { id: '15-cat-detail', route: '/cat/demo_1', title: 'Fiche chat' },
];

async function waitForApp(page, ms = 2200) {
  await page.waitForLoadState('domcontentloaded').catch(() => undefined);
  await page.waitForTimeout(ms);
}

async function shot(page, id) {
  const file = path.join(OUT_DIR, `${id}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return path.relative(path.join(__dirname, '..'), file);
}

async function goto(page, route) {
  const url = `${BASE}${route}`;
  console.log(`→ ${route}`);
  await page.goto(url, { waitUntil: 'commit', timeout: 90_000 });
  await waitForApp(page);
}

async function clickByText(page, text, opts = {}) {
  const locator = page.getByText(text, { exact: opts.exact ?? false }).first();
  await locator.waitFor({ state: 'visible', timeout: opts.timeout ?? 15_000 });
  await locator.click();
  await waitForApp(page, opts.wait ?? 1500);
}

async function fillByLabel(page, label, value) {
  // Prefer accessible labels / nearby inputs on RN-web
  const byLabel = page.getByLabel(label).first();
  if (await byLabel.count()) {
    await byLabel.fill(value);
    return;
  }
  const placeholderMap = {
    'Pseudo': 'Ton pseudo',
    'E-mail': 'toi@email.com',
    'Mot de passe': undefined,
  };
  // Fall back: find input near text
  const inputs = page.locator('input');
  const count = await inputs.count();
  for (let i = 0; i < count; i += 1) {
    const input = inputs.nth(i);
    const ph = ((await input.getAttribute('placeholder')) || '').toLowerCase();
    const type = ((await input.getAttribute('type')) || '').toLowerCase();
    const aria = ((await input.getAttribute('aria-label')) || '').toLowerCase();
    const hay = `${ph} ${aria} ${type}`;
    if (label.toLowerCase().includes('pseudo') && (hay.includes('pseudo') || i === 0)) {
      await input.fill(value);
      return;
    }
    if (label.toLowerCase().includes('mail') && (hay.includes('mail') || type === 'email')) {
      await input.fill(value);
      return;
    }
    if (label.toLowerCase().includes('passe') && (type === 'password' || hay.includes('passe'))) {
      await input.fill(value);
      return;
    }
  }
  throw new Error(`Champ introuvable: ${label}`);
}

async function signupAndOnboard(page) {
  await goto(page, '/signup');
  const email = `demo_${Date.now()}@catdex.app`;
  const password = 'CatDexDemo1!';

  // Fill fields in DOM order: pseudo, email, password, confirm
  const inputs = page.locator('input');
  await inputs.nth(0).fill('DemoCat');
  await inputs.nth(1).fill(email);
  await inputs.nth(2).fill(password);
  await inputs.nth(3).fill(password);

  // Accept terms — checkbox / pressable
  const terms = page.getByText(/J’accepte|J'accepte|conditions/i).first();
  if (await terms.count()) {
    await terms.click();
  } else {
    const boxes = page.locator('[role="checkbox"], input[type="checkbox"]');
    if (await boxes.count()) await boxes.first().click();
  }
  await page.waitForTimeout(400);

  await clickByText(page, 'Créer mon compte', { wait: 2500 }).catch(async () => {
    await clickByText(page, 'Créer un compte', { wait: 2500 });
  });

  // Intro
  if (page.url().includes('intro') || (await page.getByText('CatDex en 3 gestes').count())) {
    const introFile = await shot(page, '04-intro');
    await clickByText(page, 'Continuer', { wait: 2000 });
    return { introFile, email };
  }

  return { introFile: null, email };
}

async function finishPermissions(page) {
  if (page.url().includes('permissions') || (await page.getByText(/Dernière étape|Localisation/i).count())) {
    const file = await shot(page, '05-permissions');
    await clickByText(page, 'Passer pour l’instant', { wait: 2500 }).catch(async () => {
      await clickByText(page, 'Plus tard', { wait: 2500 });
    });
    return file;
  }
  return null;
}

function writeGallery(results) {
  const cards = results
    .filter((r) => r.file)
    .map(
      (r) => `
    <figure>
      <img src="app/${path.basename(r.file)}" alt="${r.title}" />
      <figcaption><strong>${r.id}</strong> — ${r.title}<br/><code>${r.route || ''}</code></figcaption>
    </figure>`,
    )
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CatDex — Screenshots</title>
  <style>
    :root { color-scheme: light; font-family: Inter, system-ui, sans-serif; }
    body { margin: 0; padding: 24px; background: #F2F2F2; color: #111827; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    p { margin: 0 0 24px; color: #6B7280; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    figure { margin: 0; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(17,24,39,.08); }
    img { display: block; width: 100%; height: auto; background: #E5E7EB; }
    figcaption { padding: 12px 14px 16px; font-size: 13px; line-height: 1.4; }
    code { font-size: 12px; color: #6C63FF; }
  </style>
</head>
<body>
  <h1>CatDex — export screenshots</h1>
  <p>${results.filter((r) => r.file).length} écrans · ${VIEWPORT.width}×${VIEWPORT.height}@${VIEWPORT.deviceScaleFactor} · ${new Date().toISOString()}</p>
  <div class="grid">${cards}</div>
</body>
</html>`;
  fs.writeFileSync(GALLERY, html, 'utf8');
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  try {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (error) {
    console.error(`❌ Impossible d’atteindre ${BASE}`);
    console.error('   Lance le serveur mock-auth (voir scripts/export-screenshots.mjs).');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: VIEWPORT.width, height: VIEWPORT.height },
    deviceScaleFactor: VIEWPORT.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const results = [];

  // Public screens (fresh context each time so we stay logged out)
  for (const screen of PUBLIC_SCREENS) {
    const p = await context.newPage();
    await goto(p, screen.route);
    const file = await shot(p, screen.id);
    results.push({ ...screen, file });
    await p.close();
  }

  // Authenticated journey on a single page
  try {
    const { introFile } = await signupAndOnboard(page);
    if (introFile) {
      results.push({ id: '04-intro', route: '/intro', title: 'Intro', file: introFile });
    } else {
      await goto(page, '/intro');
      results.push({ id: '04-intro', route: '/intro', title: 'Intro', file: await shot(page, '04-intro') });
      await clickByText(page, 'Continuer', { wait: 2000 }).catch(() => undefined);
    }

    const permFile = await finishPermissions(page);
    if (permFile) {
      results.push({ id: '05-permissions', route: '/permissions', title: 'Permissions', file: permFile });
    }

    for (const screen of APP_SCREENS) {
      if (screen.id === '04-intro' || screen.id === '05-permissions') continue;
      await goto(page, screen.route);
      const file = await shot(page, screen.id);
      results.push({ ...screen, file });
    }
  } catch (error) {
    console.error('Auth journey failed:', error instanceof Error ? error.message : error);
    // Fallback: still try routes (may land on welcome)
    for (const screen of APP_SCREENS) {
      if (results.some((r) => r.id === screen.id)) continue;
      try {
        await goto(page, screen.route);
        results.push({ ...screen, file: await shot(page, screen.id) });
      } catch (err) {
        console.error(`  ✗ ${screen.id}`, err instanceof Error ? err.message : err);
      }
    }
  }

  await browser.close();
  results.sort((a, b) => a.id.localeCompare(b.id));
  writeGallery(results);
  fs.writeFileSync(
    path.join(__dirname, '..', 'screenshots', 'manifest.json'),
    JSON.stringify({ base: BASE, generatedAt: new Date().toISOString(), viewport: VIEWPORT, screens: results }, null, 2),
  );
  console.log(`\n✅ ${results.filter((r) => r.file).length} screenshots → screenshots/app/`);
  console.log(`🖼  Gallery: screenshots/index.html`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

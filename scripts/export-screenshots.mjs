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

const OUT_DIR = path.join(__dirname, '..', 'screenshots', 'flow-export');
const GALLERY = path.join(__dirname, '..', 'screenshots', 'flow-export', 'index.html');
const BASE = (process.argv[2] || process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:8081').replace(
  /\/$/,
  '',
);

const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2 };
/** Cap absurdly tall pages (infinite lists / maps). */
const MAX_FULL_HEIGHT = 12_000;

const PUBLIC_SCREENS = [
  { id: '01-welcome', route: '/welcome', title: 'Welcome' },
  { id: '02-login', route: '/login', title: 'Connexion' },
  { id: '03-signup', route: '/signup', title: 'Inscription' },
];

const APP_SCREENS = [
  {
    id: '04-intro',
    route: '/intro',
    title: 'Onboarding · Apparition',
    beforeOnboarding: true,
  },
  {
    id: '05-scan',
    route: '/permissions',
    title: 'Onboarding · Analyse IA',
    beforeOnboarding: true,
  },
  {
    id: '06-reward',
    route: '/onboarding-reward',
    title: 'Onboarding · Premier chat',
    beforeOnboarding: true,
  },
  { id: '07-map', route: '/map', title: 'Explorer (carte)' },
  { id: '08-catdex', route: '/catdex', title: 'CatDex' },
  { id: '09-missions', route: '/missions', title: 'Missions' },
  { id: '10-profile', route: '/profile', title: 'Profil' },
  { id: '11-scanner', route: '/scanner', title: 'Scanner / Capture' },
  { id: '12-discovery', route: '/discovery', title: 'Discovery' },
  { id: '13-settings-profile', route: '/settings/edit-profile', title: 'Réglages · Profil' },
  { id: '14-settings-notifications', route: '/settings/notifications', title: 'Réglages · Notifs' },
  { id: '15-settings-help', route: '/settings/help', title: 'Réglages · Aide' },
  { id: '16-cat-detail', route: '/cat/demo_1', title: 'Fiche chat' },
];

async function waitForApp(page, ms = 2200) {
  await page.waitForLoadState('domcontentloaded').catch(() => undefined);
  await page.waitForTimeout(ms);
}

/**
 * Measure the tallest scrollable content so we capture the full screen,
 * not just the iPhone viewport crop.
 */
async function measureContentHeight(page) {
  return page.evaluate(() => {
    let max = 0;

    // Real overflow: scrollHeight beyond the visible client area.
    for (const el of document.querySelectorAll('div, main, section, article')) {
      const style = window.getComputedStyle(el);
      const scrollable =
        /(auto|scroll)/.test(style.overflowY) ||
        /(auto|scroll)/.test(style.overflow);
      if (!scrollable) continue;
      if (el.scrollHeight <= el.clientHeight + 8) continue;
      max = Math.max(max, el.scrollHeight);
    }

    // Bottom of meaningful UI (text, controls, images) — skips empty canvas.
    const contentSel =
      'p, h1, h2, h3, h4, span, label, button, a, input, textarea, img, svg, [role="button"], [role="switch"], [role="header"]';
    let paintBottom = 0;
    for (const el of document.querySelectorAll(contentSel)) {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (Number(style.opacity) === 0) continue;
      const rect = el.getBoundingClientRect();
      if (rect.height < 1 || rect.width < 1) continue;
      paintBottom = Math.max(paintBottom, rect.bottom + window.scrollY);
    }

    return Math.max(max, Math.ceil(paintBottom) + 16, 320);
  });
}

async function shot(page, id) {
  const file = path.join(OUT_DIR, `${id}.png`);

  // Probe at phone height first.
  await page.setViewportSize({
    width: VIEWPORT.width,
    height: VIEWPORT.height,
  });
  await page.waitForTimeout(200);

  let contentH = await measureContentHeight(page);

  // If content overflows the phone viewport, grow so lists lay out fully.
  if (contentH > VIEWPORT.height + 40) {
    const target = Math.min(MAX_FULL_HEIGHT, Math.ceil(contentH) + 48);
    await page.setViewportSize({ width: VIEWPORT.width, height: target });
    await page.waitForTimeout(500);
    contentH = await measureContentHeight(page);

    for (let i = 0; i < 2; i += 1) {
      const next = Math.min(MAX_FULL_HEIGHT, Math.max(320, Math.ceil(contentH) + 48));
      await page.setViewportSize({ width: VIEWPORT.width, height: next });
      await page.waitForTimeout(300);
      const again = await measureContentHeight(page);
      if (again <= contentH + 8) {
        contentH = again;
        break;
      }
      contentH = again;
    }
  }

  const finalH = Math.min(
    MAX_FULL_HEIGHT,
    Math.max(320, Math.ceil(contentH) + 24),
  );
  await page.setViewportSize({ width: VIEWPORT.width, height: finalH });
  await page.waitForTimeout(250);

  await page.screenshot({
    path: file,
    fullPage: true,
    animations: 'disabled',
  });

  await page.setViewportSize({
    width: VIEWPORT.width,
    height: VIEWPORT.height,
  });

  return path.relative(path.join(__dirname, '..'), file);
}

async function goto(page, route) {
  const url = `${BASE}${route}`;
  console.log(`→ ${route}`);
  await page.goto(url, { waitUntil: 'commit', timeout: 90_000 });
  await waitForApp(page);
}

async function clickByText(page, text, opts = {}) {
  // Prefer role=button (PrimaryCTA) — getByText alone can miss nested RN-web labels.
  const byRole = page.getByRole('button', { name: text }).first();
  if (await byRole.count()) {
    await byRole.waitFor({ state: 'visible', timeout: opts.timeout ?? 15_000 });
    await byRole.click();
    await waitForApp(page, opts.wait ?? 1500);
    return;
  }
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

  // Game-feel trilogy step 1 — sighting
  const onIntro =
    page.url().includes('intro') ||
    (await page.getByText(/Un chat vient d|Partir explorer|CatDex en 3 gestes/i).count());
  if (onIntro) {
    await page.waitForTimeout(800);
    const introFile = await shot(page, '04-intro');
    await clickByText(page, 'Partir explorer', { wait: 2000 }).catch(async () => {
      await clickByText(page, 'Continuer', { wait: 2000 });
    });
    return { introFile, email };
  }

  return { introFile: null, email };
}

/** Steps 2–3: IA scan → reward card, then enter map. */
async function finishOnboardingTrilogy(page) {
  const files = { scan: null, reward: null };

  const onScan =
    page.url().includes('permissions') ||
    (await page.getByText(/L’IA découvre|L'IA découvre|Race détectée|Trouver mon premier chat/i).count());
  if (onScan) {
    // Let reveal checklist populate (~400 + 5×300 ms)
    await page.waitForTimeout(2200);
    files.scan = await shot(page, '05-scan');
    await clickByText(page, 'Trouver mon premier chat', { wait: 2200 }).catch(async () => {
      await clickByText(page, 'Continuer', { wait: 2200 });
    });
  }

  const onReward =
    page.url().includes('onboarding-reward') ||
    (await page.getByText(/Nouveau chat|Commencer ma collection|Premier compagnon/i).count());
  if (onReward) {
    await page.waitForTimeout(1200);
    files.reward = await shot(page, '06-reward');
    await clickByText(page, 'Commencer ma collection', { wait: 2500 }).catch(async () => {
      await clickByText(page, 'Continuer', { wait: 2500 });
    });

    // Optional PWA sheet (web) — dismiss if present
    const pwa = page.getByText(/Accès rapide CatDex|Ajouter à l’écran d’accueil|Sur l’écran d’accueil/i);
    if (await pwa.count()) {
      files.pwa = await shot(page, '06b-pwa-home');
      await clickByText(page, 'Continuer vers la carte', { wait: 1200 }).catch(async () => {
        await clickByText(page, 'Plus tard', { wait: 1200 }).catch(async () => {
          await clickByText(page, 'Continuer', { wait: 1200 });
        });
      });
    }

    // Support / Revolut modal after onboarding
    const support = page.getByText(/CatDex est gratuit|Soutenir via Revolut/i);
    if (await support.count()) {
      await page.waitForTimeout(400);
      files.support = await shot(page, '06c-support');
      await clickByText(page, 'Continuer', { wait: 2500 });
    }
  }

  return files;
}

function writeGallery(results) {
  const cards = results
    .filter((r) => r.file)
    .map(
      (r) => `
    <figure>
      <img src="${path.basename(r.file)}" alt="${r.title}" />
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
  <p>${results.filter((r) => r.file).length} écrans · largeur ${VIEWPORT.width}px · hauteur complète (full page) @${VIEWPORT.deviceScaleFactor}x · ${new Date().toISOString()}</p>
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

  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {}),
  });
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
      results.push({
        id: '04-intro',
        route: '/intro',
        title: 'Onboarding · Apparition',
        file: introFile,
      });
    } else {
      await goto(page, '/intro');
      await page.waitForTimeout(800);
      results.push({
        id: '04-intro',
        route: '/intro',
        title: 'Onboarding · Apparition',
        file: await shot(page, '04-intro'),
      });
      await clickByText(page, 'Partir explorer', { wait: 2000 }).catch(() => undefined);
    }

    const trilogy = await finishOnboardingTrilogy(page);
    if (trilogy.scan) {
      results.push({
        id: '05-scan',
        route: '/permissions',
        title: 'Onboarding · Analyse IA',
        file: trilogy.scan,
      });
    }
    if (trilogy.reward) {
      results.push({
        id: '06-reward',
        route: '/onboarding-reward',
        title: 'Onboarding · Premier chat',
        file: trilogy.reward,
      });
    }
    if (trilogy.pwa) {
      results.push({
        id: '06b-pwa-home',
        route: '/onboarding-reward',
        title: 'Post-onboarding · Écran d’accueil',
        file: trilogy.pwa,
      });
    }
    if (trilogy.support) {
      results.push({
        id: '06c-support',
        route: '/onboarding-reward',
        title: 'Post-onboarding · CatDex gratuit / Revolut',
        file: trilogy.support,
      });
    }

    for (const screen of APP_SCREENS) {
      if (screen.beforeOnboarding) continue;
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
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify({ base: BASE, generatedAt: new Date().toISOString(), viewport: VIEWPORT, screens: results }, null, 2),
  );
  console.log(`\n✅ ${results.filter((r) => r.file).length} screenshots → screenshots/flow-export/`);
  console.log(`🖼  Gallery: screenshots/flow-export/index.html`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

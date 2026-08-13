#!/usr/bin/env node
/**
 * Phase 5 typography migration:
 * - h1/h2/h3 → headline/title
 * - style fontFamily: fonts.* on <Text> → weight prop (or drop if redundant)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');

function rgList(pattern) {
  try {
    return execFileSync(
      'rg',
      [
        '-l',
        pattern,
        '-g',
        '*.ts',
        '-g',
        '*.tsx',
        '--glob',
        '!node_modules/**',
        '--glob',
        '!**/ChatDex Mobile App UI/**',
        '.',
      ],
      { cwd: root, encoding: 'utf8' },
    )
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((p) => p.replace(/^\.\//, ''));
  } catch (e) {
    if (e.stdout) {
      return String(e.stdout)
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((p) => p.replace(/^\.\//, ''));
    }
    return [];
  }
}

const files = [
  ...new Set([
    ...rgList('variant="h1"'),
    ...rgList('variant="h2"'),
    ...rgList('variant="h3"'),
    ...rgList('fontFamily: fonts\\.'),
  ]),
];
console.log('files:', files.length);

const FACE_TO_WEIGHT = {
  display: 'semibold',
  displaySemi: 'semibold',
  body: 'regular',
  bodyMedium: 'medium',
  bodySemi: 'semibold',
  bodyBold: 'bold',
  bodyBlack: 'bold',
};

const VARIANT_DEFAULT_WEIGHT = {
  display: 'semibold',
  headline: 'semibold',
  title: 'semibold',
  body: 'regular',
  bodySmall: 'regular',
  label: 'semibold',
  button: 'semibold',
  link: 'medium',
  caption: 'regular',
  h1: 'semibold',
  h2: 'semibold',
  h3: 'semibold',
};

function renameVariants(src) {
  return src
    .replace(/variant="h1"/g, 'variant="headline"')
    .replace(/variant="h2"/g, 'variant="title"')
    .replace(/variant="h3"/g, 'variant="title"');
}

function migrateTextFontFamilies(src) {
  return src.replace(/<Text\b([\s\S]*?)>/g, (full, attrs) => {
    if (!/fontFamily:\s*fonts\./.test(attrs)) return full;

    const faceMatch = attrs.match(/fontFamily:\s*fonts\.(\w+)/);
    if (!faceMatch) return full;
    const face = faceMatch[1];
    const weight = FACE_TO_WEIGHT[face];
    if (!weight) return full;

    const variantMatch = attrs.match(/variant="(\w+)"/);
    const variant = variantMatch ? variantMatch[1] : 'body';
    const defaultW = VARIANT_DEFAULT_WEIGHT[variant] ?? 'regular';
    const needsWeight = weight !== defaultW;

    let next = attrs.replace(/\s*fontFamily:\s*fonts\.\w+\s*,?/, '');

    next = next.replace(/style=\{\{\s*,/g, 'style={{');
    next = next.replace(/,\s*,/g, ',');
    next = next.replace(/,\s*\}\}/g, ' }}');
    next = next.replace(/\s*style=\{\{\s*\}\}/g, '');

    if (needsWeight && !/\bweight=/.test(next)) {
      if (/variant="[^"]+"/.test(next)) {
        next = next.replace(/(variant="[^"]+")/, `$1 weight="${weight}"`);
      } else {
        next = ` weight="${weight}"` + next;
      }
    }

    return `<Text${next}>`;
  });
}

function cleanupStyleObjects(src) {
  let out = src;
  out = out.replace(/style=\{\{\s*,\s*/g, 'style={{ ');
  out = out.replace(/,\s*\}\}/g, ' }}');
  out = out.replace(/\s*style=\{\{\s*\}\}/g, '');
  return out;
}

function removeUnusedFontsImport(src) {
  if (/\bfonts\./.test(src)) return src;
  return src.replace(/const \{([^}]*)\}\s*=\s*useTheme\(\)/g, (full, inner) => {
    if (!/\bfonts\b/.test(inner)) return full;
    const cleaned = inner
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !/^fonts$/.test(s))
      .join(', ');
    return `const { ${cleaned} } = useTheme()`;
  });
}

let changed = 0;
for (const rel of files) {
  const abs = path.join(root, rel);
  const before = fs.readFileSync(abs, 'utf8');
  let after = renameVariants(before);
  after = migrateTextFontFamilies(after);
  after = cleanupStyleObjects(after);
  after = removeUnusedFontsImport(after);
  if (after !== before) {
    fs.writeFileSync(abs, after);
    changed += 1;
    console.log('updated', rel);
  }
}
console.log(`\nDone. ${changed}/${files.length} files changed.`);

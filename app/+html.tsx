import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Custom HTML shell for the web beta.
 * Locks document height so the mobile phone frame can fill the viewport,
 * and tints the desktop backdrop behind the centered app.
 * Also wires PWA installability (manifest + minimal service worker).
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#6A69F8" />
        <meta name="application-name" content="CatDex" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CatDex" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: rootStyles }} />
        <script dangerouslySetInnerHTML={{ __html: registerServiceWorker }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const registerServiceWorker = `
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}
`;

const rootStyles = `
html, body, #root {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
body {
  background-color: #15172B;
  overflow: hidden;
}
#root {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  min-height: 100dvh;
}
@media (max-width: 479px) {
  body {
    background-color: #F9F9FB;
    overflow: auto;
  }
}
`;

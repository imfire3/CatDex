import { ScrollViewStyleReset } from 'expo-router/html'
import type { PropsWithChildren } from 'react'

/**
 * Custom HTML shell for the web beta.
 * Locks document height so the mobile phone frame can fill the viewport,
 * and tints the desktop backdrop behind the centered app.
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
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: rootStyles }} />
      </head>
      <body>{children}</body>
    </html>
  )
}

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
`

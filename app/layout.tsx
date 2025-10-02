import './globals.css';
import { ReactNode } from 'react';
import { headers } from 'next/headers';
import Script from 'next/script';
import { dmSans, cormorant } from './fonts';
import { Providers } from './providers';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://gleicemonteiro.com'),
  title: {
    default: 'Gleice Monteiro | Consultoria de Imagem de Alto Padrão',
    template: '%s | Gleice Monteiro'
  },
  description:
    'Plataforma completa de consultoria de imagem com dashboards inteligentes, questionários de estilo e gestão de lookbooks exclusivos.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/logo.svg',
    apple: '/icons/logo.svg'
  },
  themeColor: '#1f1f1f',
  alternates: {
    canonical: 'https://gleicemonteiro.com'
  },
  openGraph: {
    title: 'Gleice Monteiro Consultoria de Imagem',
    description:
      'Consultoria de imagem sofisticada para mulheres que desejam comunicar autoridade com autenticidade.',
    siteName: 'Gleice Monteiro',
    url: 'https://gleicemonteiro.com',
    images: [
      {
        url: 'https://gleicemonteiro.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Consultoria de Imagem Gleice Monteiro'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gleice Monteiro Consultoria de Imagem'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Gleice Monteiro Consultoria de Imagem',
  url: 'https://gleicemonteiro.com',
  logo: 'https://gleicemonteiro.com/icons/logo.svg',
  description:
    'Consultoria de imagem e estilo para clientes premium com lookbooks personalizados, análises de guarda-roupa e acompanhamento completo.',
  sameAs: [
    'https://www.instagram.com/gleicemonteiro',
    'https://www.linkedin.com/in/gleicemonteiro'
  ],
  areaServed: 'Brasil',
  serviceType: [
    'Consultoria de Imagem',
    'Gestão de Guarda-Roupa',
    'Personal Shopper',
    'Styling para Eventos'
  ]
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const nonce = headers().get('x-nonce');

  return (
    <html lang="pt-BR" className={`${dmSans.variable} ${cormorant.variable}`}> 
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="color-scheme" content="light" />
        {nonce && (
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{ __html: `window.__CSP_NONCE__='${nonce}';` }}
          />
        )}
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
          <Script
            nonce={nonce ?? undefined}
            src={`https://challenges.cloudflare.com/turnstile/v0/api.js?render=${process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}`}
            strategy="lazyOnload"
          />
        ) : null}
        <script
          type="application/ld+json"
          nonce={nonce ?? undefined}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#f8f8f8] text-foreground antialiased">
        <Providers nonce={nonce}>{children}</Providers>
      </body>
    </html>
  );
}

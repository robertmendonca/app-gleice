import type { DefaultSeoProps } from 'next-seo';

export const defaultSeo: DefaultSeoProps = {
  title: 'Gleice Monteiro Consultoria de Imagem',
  description:
    'Consultoria de imagem e estilo para mulheres que buscam presença marcante com sofisticação e autenticidade.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://gleicemonteiro.com',
    siteName: 'Gleice Monteiro',
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
    cardType: 'summary_large_image'
  },
  additionalMetaTags: [
    {
      name: 'theme-color',
      content: '#1f1f1f'
    }
  ]
};

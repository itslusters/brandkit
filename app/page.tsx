import { WelcomeScreens } from '@/components/welcome/WelcomeScreens'

const BASE = 'https://brandkit-wheat.vercel.app'

// Static structured data — no runtime fetch, so the entry paints instantly.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Atriium',
  url: BASE,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web, iOS',
  description: 'AI brand workspace — name, logo, palette, mockups, and a brand guide in minutes.',
  offers: [{ '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' }],
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WelcomeScreens />
    </>
  )
}

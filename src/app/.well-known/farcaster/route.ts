import { NextResponse } from 'next/server';

// Get the base URL
const getBaseUrl = () => {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL;
  }
  return 'http://localhost:3000';
};

const ROOT_URL = getBaseUrl();

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "",
      payload: "",
      signature: ""
    },
    baseBuilder: {
      ownerAddress: "0x..."
    },
    miniapp: {
      version: "1",
      name: "Tap to Baldbaseappp",
      homeUrl: ROOT_URL,
      iconUrl: `${ROOT_URL}/slap/blad.png`,
      splashImageUrl: `${ROOT_URL}/slap/blad.png`,
      splashBackgroundColor: "#000",
      webhookUrl: `${ROOT_URL}/api/webhook`,
      subtitle: "Tap the bald head game",
      description: "Play a fun tapping game and mint NFTs. Tap the bald head to score points while avoiding blue squares!",
      screenshotUrls: [
        `${ROOT_URL}/slap/blad.png`,
        `${ROOT_URL}/slap/hand.png`
      ],
      primaryCategory: "games",
      tags: ["games", "nft", "blockchain", "casual"],
      heroImageUrl: `${ROOT_URL}/slap/blad.png`,
      tagline: "Tap, play, mint",
      ogTitle: "Tap to Baldbase",
      ogDescription: "Tap the bald head game with NFT minting",
      ogImageUrl: `${ROOT_URL}/slap/blad.png`,
      noindex: true
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}


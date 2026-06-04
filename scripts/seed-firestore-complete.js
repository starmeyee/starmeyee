const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Seed datasets
const SEED_DATA = {
  users: [
    {
      id: 'test_admin_uid',
      data: {
        uid: 'test_admin_uid',
        email: 'admin@starmeyee.in',
        displayName: 'StarMeyee Owner',
        photoURL: '/profile.jpeg',
        role: 'owner',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],
  homepage_sections: [
    {
      id: 'hero_sec',
      data: {
        type: 'hero',
        title: 'Hero Section',
        enabled: true,
        displayOrder: 0,
        content: {
          headline: "Welcome to StarMeyee",
          subheadline: "Exploring the cosmos of stories and art.",
          ctaButtons: [{ label: "Explore Library", link: "/writes" }]
        },
        updatedAt: new Date()
      }
    },
    {
      id: 'about_sec',
      data: {
        type: 'about_preview',
        title: 'About Preview',
        enabled: true,
        displayOrder: 1,
        content: {
          title: "Who Am I?",
          description: "I am StarMeyee, a writer and space enthusiast exploring cosmic visual design and narratives."
        },
        updatedAt: new Date()
      }
    },
    {
      id: 'love_sec',
      data: {
        type: 'custom',
        title: 'Things I Love',
        enabled: true,
        displayOrder: 2,
        content: {
          items: [
            { title: "Astronomy", description: "Stargazing and pondering the vastness of the universe.", icon: "🔭" },
            { title: "Aesthetics", description: "Minimalism, deep space colors, and visual art.", icon: "🎨" },
            { title: "Philosophy", description: "Stoicism, existentialism, and deep questions.", icon: "📚" }
          ]
        },
        updatedAt: new Date()
      }
    },
    {
      id: 'music_sec',
      data: {
        type: 'music_preview',
        title: 'Soundscapes',
        enabled: true,
        displayOrder: 3,
        content: { description: "Melodies that accompany the thoughts." },
        updatedAt: new Date()
      }
    },
    {
      id: 'gallery_sec',
      data: {
        type: 'gallery_preview',
        title: 'The Observatory',
        enabled: true,
        displayOrder: 4,
        content: { description: "Glimpses into the cosmic visual journey." },
        updatedAt: new Date()
      }
    },
    {
      id: 'news_sec',
      data: {
        type: 'newsletter',
        title: 'Join the Cosmos',
        enabled: true,
        displayOrder: 5,
        content: {},
        updatedAt: new Date()
      }
    }
  ],
  novel_categories: [
    {
      id: 'sci_fi',
      data: { name: 'Sci-Fi', slug: 'sci-fi', createdAt: new Date() }
    },
    {
      id: 'philosophy',
      data: { name: 'Philosophy', slug: 'philosophy', createdAt: new Date() }
    }
  ],
  novels: [
    {
      id: 'cosmic_journey',
      data: {
        title: 'The Cosmic Wanderer',
        slug: 'cosmic-wanderer',
        description: 'A journey through the stars to find the meaning of existence.',
        coverImage: '/observatory-mock.jpg',
        status: 'published',
        featured: true,
        categories: ['sci_fi', 'philosophy'],
        seoTitle: 'The Cosmic Wanderer | StarMeyee',
        seoDescription: 'A sci-fi story about a wanderer searching for existence\'s meaning.',
        ogImage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],
  // We need novel_chapters to link the novel page hierarchy
  novel_chapters: [
    {
      id: 'chapter_1',
      data: {
        novelId: 'cosmic_journey',
        title: 'Chapter 1: The Call of the Void',
        slug: 'chapter-1-call-of-void',
        displayOrder: 0,
        published: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],
  novel_pages: [
    {
      id: 'page_1',
      data: {
        chapterId: 'chapter_1',
        title: 'Page 1',
        displayOrder: 0,
        blocks: [
          { id: 'b1', type: 'text', content: { text: 'The stars were cold and distant, yet they felt closer than home.' }, order: 0 }
        ],
        published: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],
  product_categories: [
    {
      id: 'books',
      data: { name: 'E-Books', slug: 'e-books', createdAt: new Date() }
    },
    {
      id: 'art',
      data: { name: 'Art Prints', slug: 'art-prints', createdAt: new Date() }
    }
  ],
  products: [
    {
      id: 'book_product',
      data: {
        title: 'The Cosmic Wanderer (Digital Edition)',
        slug: 'cosmic-wanderer-digital',
        description: 'Get the complete digital ebook with exclusive illustrations.',
        coverImage: '/observatory-mock.jpg',
        price: 4.99,
        gumroadLink: 'https://gumroad.com',
        featured: true,
        status: 'published',
        categories: ['books'],
        seoTitle: 'E-Book: The Cosmic Wanderer',
        seoDescription: 'Buy the complete digital ebook of The Cosmic Wanderer.',
        ogImage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],
  gallery_items: [
    {
      id: 'gal_item_1',
      data: {
        title: 'Orion Nebula',
        description: 'A vibrant nursery of stars in the deep sky.',
        imageUrl: '/observatory-mock.jpg',
        featuredOnHomepage: true,
        featuredInObservatory: true,
        displayOrder: 0,
        createdAt: new Date()
      }
    }
  ],
  music_items: [
    {
      id: 'mus_item_1',
      data: {
        songTitle: 'Sparkle',
        artist: 'RADWIMPS',
        album: 'Your Name',
        spotifyLink: 'https://open.spotify.com/track/3cr1595U4n4wFCS2e5Vkl2',
        coverImage: '/music-mock.jpg',
        featured: true,
        displayOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],
  newsletter_settings: [
    {
      id: 'main',
      data: {
        headline: "Join the Cosmic Circle",
        description: "Subscribe to receive the latest updates, thoughts, and cosmic musings directly in your inbox.",
        ctaText: "Subscribe",
        provider: "beehiiv",
        enabled: true,
        updatedAt: new Date()
      }
    }
  ],
  about_content: [
    {
      id: 'who_am_i',
      data: {
        key: 'who_am_i',
        label: 'Who Am I',
        content: '<p>I am StarMeyee, a writer and space enthusiast exploring cosmic visual design and narratives.</p>',
        updatedAt: new Date()
      }
    },
    {
      id: 'things_i_wonder',
      data: {
        key: 'things_i_wonder',
        label: 'Things I Wonder About',
        content: '<p>How large is the universe? What lies beyond the event horizon?</p>',
        updatedAt: new Date()
      }
    },
    {
      id: 'things_i_love',
      data: {
        key: 'things_i_love',
        label: 'Things I Love',
        content: '<p>Astronomy, visual aesthetics, storytelling, RADWIMPS, Fujii Kaze, and YOASOBI.</p>',
        updatedAt: new Date()
      }
    },
    {
      id: 'current_mission',
      data: {
        key: 'current_mission',
        label: 'Current Mission',
        content: '<p>Building a beautiful visual repository of stories.</p>',
        updatedAt: new Date()
      }
    },
    {
      id: 'long_form_story',
      data: {
        key: 'long_form_story',
        label: 'Long Form Story',
        content: '<p>Once upon a time, in a galaxy not far away, a spark of curiosity lit up the sky...</p>',
        updatedAt: new Date()
      }
    }
  ],
  social_links: [
    {
      id: 'insta',
      data: { platform: 'Instagram', url: 'https://www.instagram.com/star_meyee/', displayOrder: 0, enabled: true }
    },
    {
      id: 'twitter',
      data: { platform: 'Twitter', url: 'https://twitter.com/star_meyee', displayOrder: 1, enabled: true }
    }
  ],
  site_settings: [
    {
      id: 'main',
      data: {
        siteName: "StarMeyee",
        seoDefaultTitle: "StarMeyee — Cosmic Stories & Art",
        seoDefaultDescription: "Exploring the cosmic depths of imagination, storytelling, and digital visuals.",
        brandColors: {
          primary: "#0b0b1e",
          accent: "#4D55CC",
          secondary: "#7A73D1",
          soft: "#B5A8D5"
        },
        fonts: {
          body: "Klee One",
          display: "Oleo Script",
          accent: "Schoolbell"
        },
        footerContent: "Exploring the cosmic depths of imagination.",
        credits: `© 2026 StarMeyee. All rights reserved.`,
        updatedAt: new Date()
      }
    }
  ],
  subscribers: [
    {
      id: 'sample_sub',
      data: {
        email: 'test-subscriber@starmeyee.in',
        subscribedAt: new Date(),
        active: true
      }
    }
  ]
};

async function runSeeder() {
  console.log("Initializing Firebase app...");
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log("Firestore client connected.");

  const report = {
    created: 0,
    skipped: 0,
    failed: 0,
    details: []
  };

  console.log("\n=================== STARTING SEEDER ===================");

  for (const [collectionName, documents] of Object.entries(SEED_DATA)) {
    console.log(`Processing collection: "${collectionName}"...`);
    for (const docInfo of documents) {
      const docRef = doc(db, collectionName, docInfo.id);
      try {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          report.skipped++;
          const msg = `  - Document "${docInfo.id}" already exists in "${collectionName}". Skipping.`;
          console.log(msg);
          report.details.push({ collection: collectionName, id: docInfo.id, status: 'SKIPPED', reason: 'Already exists' });
        } else {
          // Document does not exist. Write it.
          await setDoc(docRef, docInfo.data);
          report.created++;
          const msg = `  - Document "${docInfo.id}" in "${collectionName}" created successfully!`;
          console.log(msg);
          report.details.push({ collection: collectionName, id: docInfo.id, status: 'CREATED' });
        }
      } catch (error) {
        report.failed++;
        const msg = `  - FAILED document "${docInfo.id}" in "${collectionName}": ${error.message}`;
        console.error(msg);
        report.details.push({ collection: collectionName, id: docInfo.id, status: 'FAILED', error: error.message });
      }
    }
  }

  console.log("\n=================== SEEDING COMPLETE ===================");
  console.log(`Summary:`);
  console.log(`  - Documents Created: ${report.created}`);
  console.log(`  - Documents Skipped (Already Exists): ${report.skipped}`);
  console.log(`  - Failures: ${report.failed}`);
  console.log("========================================================\n");

  process.exit(report.failed > 0 ? 1 : 0);
}

runSeeder().catch(err => {
  console.error("Seeder execution crash:", err);
  process.exit(1);
});

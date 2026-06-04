export type Role = "owner" | "admin" | "editor" | "user";

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Novel Types ──────────────────────────────────────────────────────────────

export type NovelStatus = "draft" | "published" | "archived";

export interface Novel {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  status: NovelStatus;
  featured: boolean;
  categories: string[]; // category IDs
  seoTitle: string;
  seoDescription: string;
  ogImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NovelCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export type BlockType = "text" | "image" | "sticker" | "quote" | "divider" | "callout" | "custom";

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: Record<string, any>;
  order: number;
}

export interface NovelChapter {
  id: string;
  novelId: string;
  title: string;
  slug: string;
  displayOrder: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NovelPage {
  id: string;
  chapterId: string;
  title: string;
  displayOrder: number;
  blocks: ContentBlock[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sticker {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  createdAt: Date;
}

export interface ReadProgress {
  id: string; // userId or anonymousId
  novelId: string;
  chapterId: string;
  pageId: string;
  completionPercent: number;
  updatedAt: Date;
}

// ─── Product Types ────────────────────────────────────────────────────────────

export type ProductStatus = "draft" | "published" | "archived";

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  price: number;
  gumroadLink: string;
  featured: boolean;
  status: ProductStatus;
  categories: string[];
  seoTitle: string;
  seoDescription: string;
  ogImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

// ─── Blog Types ───────────────────────────────────────────────────────────────

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string | null;
  authorId: string;
  published: boolean;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Gallery / Observatory Types ──────────────────────────────────────────────

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  featuredOnHomepage: boolean;
  featuredInObservatory: boolean;
  displayOrder: number;
  createdAt: Date;
}

// ─── Music Types ──────────────────────────────────────────────────────────────

export interface MusicItem {
  id: string;
  songTitle: string;
  artist: string;
  album: string;
  spotifyLink: string;
  coverImage: string | null;
  featured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Homepage Section Types ───────────────────────────────────────────────────

export type HomepageSectionType =
  | "hero"
  | "featured_novel"
  | "about_preview"
  | "music_preview"
  | "gallery_preview"
  | "newsletter"
  | "custom";

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title: string;
  content: Record<string, unknown>;
  enabled: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── About Content Types ──────────────────────────────────────────────────────

export interface AboutSection {
  id: string;
  key: "who_am_i" | "things_i_wonder" | "things_i_love" | "current_mission" | "long_form_story";
  label: string;
  content: string;
  updatedAt: Date;
}

// ─── Newsletter Types ─────────────────────────────────────────────────────────

export interface NewsletterSettings {
  id: string;
  headline: string;
  description: string;
  ctaText: string;
  provider: string; // e.g. "beehiiv", "mailchimp"
  enabled: boolean;
  updatedAt: Date;
}

// ─── Social Links Types ───────────────────────────────────────────────────────

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  displayOrder: number;
  enabled: boolean;
}

// ─── Site Settings Types ──────────────────────────────────────────────────────

export interface SiteSettings {
  id: string;
  siteName: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  brandColors: {
    primary: string;
    accent: string;
    secondary: string;
    soft: string;
  };
  fonts: {
    body: string;
    display: string;
    accent: string;
  };
  footerContent: string;
  credits: string;
  updatedAt: Date;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface Analytics {
  id: string;
  date: string; // YYYY-MM-DD
  pageViews: number;
  uniqueVisitors: number;
}

// ─── Subscriber Types ─────────────────────────────────────────────────────────

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: Date;
  active: boolean;
}

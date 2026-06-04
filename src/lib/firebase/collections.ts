export const COLLECTIONS = {
  USERS: 'users',
  NOVELS: 'novels',
  NOVEL_CHAPTERS: 'novel_chapters',
  NOVEL_PAGES: 'novel_pages',
  NOVEL_CATEGORIES: 'novel_categories',
  PRODUCTS: 'products',
  PRODUCT_CATEGORIES: 'product_categories',
  BLOGS: 'blogs',
  GALLERY_ITEMS: 'gallery_items',
  MUSIC_ITEMS: 'music_items',
  HOMEPAGE_SECTIONS: 'homepage_sections',
  ABOUT_CONTENT: 'about_content',
  NEWSLETTER_SETTINGS: 'newsletter_settings',
  SOCIAL_LINKS: 'social_links',
  SITE_SETTINGS: 'site_settings',
  SUBSCRIBERS: 'subscribers',
  ANALYTICS: 'analytics',
  NOVEL_ANALYTICS: 'novel_analytics',
  READ_PROGRESS: 'read_progress',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

export const siteConfig = {
  name: "StarMeyee",
  description: "StarMeyee Official Website",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  links: {
    twitter: "",
    instagram: "",
    facebook: "",
  },
  adminRole: "ADMIN",
};

export type SiteConfig = typeof siteConfig;

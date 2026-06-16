import { settingsService } from "@/lib/firebase/services/settingsService";

/**
 * Server component that reads the site's brand settings and injects them as
 * CSS variable overrides, so colors/fonts configured in the admin Settings
 * page are reflected on the live site. Falls back silently to the defaults
 * defined in globals.css when settings are missing or unreachable.
 */
export default async function BrandThemeStyle() {
  let settings = null;
  try {
    settings = await settingsService.getSettings();
  } catch (error) {
    console.error("BrandThemeStyle: failed to load settings", error);
  }

  if (!settings) return null;

  const c = settings.brandColors;
  const f = settings.fonts;
  const decls: string[] = [];

  if (c?.primary) decls.push(`--brand-primary: ${c.primary};`);
  if (c?.accent) decls.push(`--brand-accent: ${c.accent};`);
  if (c?.secondary) decls.push(`--brand-secondary: ${c.secondary};`);
  if (c?.soft) decls.push(`--brand-soft: ${c.soft};`);

  // Fonts: prepend the configured family but keep the bundled next/font
  // families as fallbacks so text never breaks if the family isn't available.
  if (f?.body) decls.push(`--font-klee: "${f.body}", var(--font-klee-one), sans-serif;`);
  if (f?.display) decls.push(`--font-oleo: "${f.display}", var(--font-oleo-script), cursive;`);
  if (f?.accent) decls.push(`--font-schoolbell: "${f.accent}", var(--font-schoolbell), cursive;`);

  if (decls.length === 0) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root{${decls.join("")}}`,
      }}
    />
  );
}

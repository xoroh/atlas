import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Xoroh Atlas documentation site. Hosting is undecided (owner matter), so
// no `site` URL is set; deployment adds it without code changes.
// URL reservations (/v/{version}, /{locale}/) are documented in
// docs/adr/0001-atlas-foundation.md and intentionally unimplemented.
export default defineConfig({
  integrations: [
    starlight({
      title: 'Xoroh Atlas',
      description: 'Reusable documentation platform for the Xoroh ecosystem.',
      sidebar: [
        { label: 'Introduction', link: '/' },
        { label: 'Getting started', slug: 'getting-started' },
        {
          label: 'Guides',
          items: [
            { label: 'Contributing', slug: 'guides/contributing' },
            { label: 'Governance', slug: 'guides/governance' },
            { label: 'Architecture', slug: 'guides/architecture' },
          ],
        },
      ],
    }),
  ],
});

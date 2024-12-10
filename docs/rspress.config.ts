import { defineConfig } from 'rspress/config';
import { pluginFontOpenSans } from 'rspress-plugin-font-open-sans';
import * as path from 'node:path';

export default defineConfig({
  root: 'src',
  title: 'byorg.ai',
  icon: '/img/favicon.ico',
  description: 'TypeScript framework for writing chatbot applications.',
  logo: {
    light: '/img/logo_mono_light.svg',
    dark: '/img/logo_mono_dark.svg',
  },
  globalStyles: path.join(__dirname, 'src/styles/index.css'),
  themeConfig: {
    enableContentAnimation: true,
    enableScrollToTop: true,
    outlineTitle: 'Contents',
    footer: {
      message: `Copyright © ${new Date().getFullYear()} Callstack Open Source`,
    },
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/callstack/byorg-ai',
      },
    ],
  },
  plugins: [pluginFontOpenSans()],
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import tailwindcss from 'tailwindcss'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'android-icon-36x36.png',
        'android-icon-48x48.png',
        'android-icon-72x72.png',
        'android-icon-96x96.png',
        'android-icon-144x144.png',
        'android-icon-192x192.png',
        'apple-icon-57x57.png',
        'apple-icon-60x60.png',
        'apple-icon-72x72.png',
        'apple-icon-76x76.png',
        'apple-icon-114x114.png',
        'apple-icon-120x120.png',
        'apple-icon-144x144.png',
        'apple-icon-152x152.png',
        'apple-icon-180x180.png',
        'apple-icon.png',
        'apple-icon-precomposed.png',
        'apple-touch-icon-180x180.png',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'favicon-96x96.png',
        'ms-icon-70x70.png',
        'ms-icon-144x144.png',
        'ms-icon-150x150.png',
        'ms-icon-310x310.png',
        'pwa-64x64.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'maskable-icon-512x512.png',
        'logo-small.png',
        'icon-square.svg',
        'logo-small.svg',
        'logo-large.svg',
        'custom/home-logo.png',
        'custom/home-logo-dark.png',
        'custom/mag.png',
        'undraw.co/undraw_to_the_moon_re_q21i.svg',
        'undraw.co/undraw_towing_e407.svg',
        'undraw.co/undraw_mindfulness_8gqa.svg',
        'undraw.co/undraw_page-not-found_6wni.svg',
        'undraw.co/undraw_partying_3qad.svg',
        'undraw.co/undraw_powerful_re_frhr.svg',
        'undraw.co/undraw_searching_re_3ra9.svg',
        'undraw.co/undraw_secure-login_m11a.svg',
        'undraw.co/undraw_server-down_lxs9.svg',
        'undraw.co/undraw_dog_c7i6.svg',
        'undraw.co/undraw_file-searching_2ne8.svg',
        'undraw.co/undraw_fun_moments_2vha.svg',
        'undraw.co/undraw_landing-page_tsx8.svg'
      ],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})

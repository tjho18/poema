import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'Poema',
    short_name:       'Poema',
    description:      'A quiet place for poems.',
    start_url:        '/',
    display:          'standalone',
    orientation:      'portrait',
    background_color: '#F7F7F5',
    theme_color:      '#F7F7F5',
    icons: [
      {
        src:     '/api/icon/192',
        sizes:   '192x192',
        type:    'image/png',
        purpose: 'any',
      },
      {
        src:     '/api/icon/512',
        sizes:   '512x512',
        type:    'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

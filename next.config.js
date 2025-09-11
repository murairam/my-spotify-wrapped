const nextConfig = {
  reactStrictMode: false, // Temporarily disabled for debugging - consider re-enabling later
  images: {
    domains: [
      'i.scdn.co',           // Spotify album/artist images
      'mosaic.scdn.co',      // Spotify playlist images
      'blend-playlist-covers.spotifycdn.com', // Spotify blend covers
      'seed-mix-image.spotifycdn.com',        // Spotify mix covers
      'charts-images.scdn.co',               // Spotify charts images
      'daily-mix.scdn.co',                   // Spotify daily mix images
      'mixed-media-images.spotifycdn.com'    // Additional Spotify media
    ],
  },
  // Fix the cross-origin warnings
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    'localhost:3001',
    '127.0.0.1:3001'
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXTAUTH_URL || 'http://127.0.0.1:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  // Optimize for better performance
  compress: true,
  poweredByHeader: false,
  // Add environment variable validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;

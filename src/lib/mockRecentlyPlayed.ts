// src/lib/mockRecentlyPlayed.ts
export interface MockRecentlyPlayedTrack {
  track: {
    id: string;
    name: string;
    artist: string;
    images: Array<{ url: string }>;
    external_urls: { spotify: string };
    album?: {
      name: string;
      images: Array<{ url: string }>;
    };
  };
  played_at: string;
}

// Generate realistic timestamps for recently played tracks
const generateRecentTimestamp = (hoursAgo: number, minutesAgo: number = 0) => {
  const now = new Date();
  return new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000)).toISOString();
};

export const mockRecentlyPlayed: MockRecentlyPlayedTrack[] = [
  {
    track: {
      id: 'rp1',
      name: 'Anti-Hero',
      artist: 'Taylor Swift',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/0V3wPSX9ygBnCm8psDIegu' },
      album: {
        name: 'Midnights',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5' }]
      }
    },
    played_at: generateRecentTimestamp(0, 15) // 15 minutes ago
  },
  {
    track: {
      id: 'rp2',
      name: 'Flowers',
      artist: 'Miley Cyrus',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b273f4b73b14b1d4cb53fce81605' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/0yLdNVWF3sUm0BSFLUTxOx' },
      album: {
        name: 'Endless Summer Vacation',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273f4b73b14b1d4cb53fce81605' }]
      }
    },
    played_at: generateRecentTimestamp(0, 45) // 45 minutes ago
  },
  {
    track: {
      id: 'rp3',
      name: 'Vampire',
      artist: 'Olivia Rodrigo',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b273e85259a1cae29a8d91f2093d' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/1kuGVB7EU95pJObxwvfwKS' },
      album: {
        name: 'GUTS',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e85259a1cae29a8d91f2093d' }]
      }
    },
    played_at: generateRecentTimestamp(1, 20) // 1 hour 20 minutes ago
  },
  {
    track: {
      id: 'rp4',
      name: 'Seven (feat. Latto)',
      artist: 'Jung Kook',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/560DGV0P1dP7eKRmGTpfG2' },
      album: {
        name: 'Seven (feat. Latto)',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5' }]
      }
    },
    played_at: generateRecentTimestamp(2, 10) // 2 hours 10 minutes ago
  },
  {
    track: {
      id: 'rp5',
      name: 'Cruel Summer',
      artist: 'Taylor Swift',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/1BxfuPKGuaTgP7aM0Bbdwr' },
      album: {
        name: 'Lover',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647' }]
      }
    },
    played_at: generateRecentTimestamp(3, 0) // 3 hours ago
  },
  {
    track: {
      id: 'rp6',
      name: 'Kill Bill',
      artist: 'SZA',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b27370dbc9f47669d120ad874ec1' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/3OHfY25tqY28d16oZczHc8' },
      album: {
        name: 'SOS',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27370dbc9f47669d120ad874ec1' }]
      }
    },
    played_at: generateRecentTimestamp(4, 30) // 4.5 hours ago
  },
  {
    track: {
      id: 'rp7',
      name: 'Unholy (feat. Kim Petras)',
      artist: 'Sam Smith',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b273906f58dbbc6634141598a1fb' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/3nqQXoyQOWXiESFLlDF1hG' },
      album: {
        name: 'Gloria',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273906f58dbbc6634141598a1fb' }]
      }
    },
    played_at: generateRecentTimestamp(5, 15) // 5.25 hours ago
  },
  {
    track: {
      id: 'rp8',
      name: 'As It Was',
      artist: 'Harry Styles',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/4Dvkj6JhhA12EX05fT7y2e' },
      album: {
        name: "Harry's House",
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0' }]
      }
    },
    played_at: generateRecentTimestamp(6, 45) // 6.75 hours ago
  },
  {
    track: {
      id: 'rp9',
      name: 'Bad Habit',
      artist: 'Steve Lacy',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b273b85ce288883a3d49248a3622' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/4k6Uh1HltlJna3gWgg6eSS' },
      album: {
        name: 'Gemini Rights',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b85ce288883a3d49248a3622' }]
      }
    },
    played_at: generateRecentTimestamp(8, 0) // 8 hours ago
  },
  {
    track: {
      id: 'rp10',
      name: 'Watermelon Sugar',
      artist: 'Harry Styles',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b2737fcead687e99583072cc217b' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/6UelLqGlWMcVH1E5c4H7lY' },
      album: {
        name: 'Fine Line',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2737fcead687e99583072cc217b' }]
      }
    },
    played_at: generateRecentTimestamp(10, 30) // 10.5 hours ago
  },
  {
    track: {
      id: 'rp11',
      name: 'About Damn Time',
      artist: 'Lizzo',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b273649bce0a39a546b8cc6cf96d' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/1PckUlxKqWQs3VlMaOG0P1' },
      album: {
        name: 'About Damn Time',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273649bce0a39a546b8cc6cf96d' }]
      }
    },
    played_at: generateRecentTimestamp(12, 0) // 12 hours ago
  },
  {
    track: {
      id: 'rp12',
      name: 'Heat Waves',
      artist: 'Glass Animals',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b27361d48bc6f64593b810b4cfec' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/02MWAaffLxlfxAUY7c5dvx' },
      album: {
        name: 'Dreamland',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27361d48bc6f64593b810b4cfec' }]
      }
    },
    played_at: generateRecentTimestamp(14, 20) // 14.33 hours ago
  },
  {
    track: {
      id: 'rp13',
      name: 'Good 4 U',
      artist: 'Olivia Rodrigo',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG' },
      album: {
        name: 'SOUR',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a' }]
      }
    },
    played_at: generateRecentTimestamp(16, 10) // 16.17 hours ago
  },
  {
    track: {
      id: 'rp14',
      name: 'Levitating',
      artist: 'Dua Lipa',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b273ef968746a39516c05d3c267b' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9' },
      album: {
        name: 'Future Nostalgia',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273ef968746a39516c05d3c267b' }]
      }
    },
    played_at: generateRecentTimestamp(18, 0) // 18 hours ago
  },
  {
    track: {
      id: 'rp15',
      name: 'Blinding Lights',
      artist: 'The Weeknd',
      images: [
        { url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' }
      ],
      external_urls: { spotify: 'https://open.spotify.com/track/0VjIjW4GlULA2BxJDUfXuN' },
      album: {
        name: 'After Hours',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' }]
      }
    },
    played_at: generateRecentTimestamp(20, 30) // 20.5 hours ago
  }
];

// Export a function to get recently played data for different time ranges
export const getRecentlyPlayedForTimeRange = (timeRange: 'short_term' | 'medium_term' | 'long_term') => {
  // For demo purposes, we can vary the recently played slightly per time range
  switch (timeRange) {
    case 'short_term':
      return mockRecentlyPlayed.slice(0, 15); // Recent 15 tracks
    case 'medium_term':
      return mockRecentlyPlayed.slice(0, 12); // Slightly fewer for medium term
    case 'long_term':
      return mockRecentlyPlayed.slice(0, 10); // Even fewer for long term
    default:
      return mockRecentlyPlayed.slice(0, 15);
  }
};


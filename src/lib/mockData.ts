export interface MockTrack {
  id: string;
  name: string;
  artist: string;
  popularity: number;
  images: Array<{ url: string }>;
  external_urls: { spotify: string };
}

export interface MockArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: Array<{ url: string }>;
  external_urls: { spotify: string };
}

export interface MockUserProfile {
  display_name: string;
  product: 'premium' | 'free';
  country: string;
  followers: { total: number };
  id: string;
}

export interface MockMusicIntelligence {
  mainstreamTaste: number;
  artistDiversity: number;
  vintageCollector: number;
  undergroundTaste: number;
  recentMusicLover: number;
  uniqueAlbumsCount: number;
}

export interface MockSpotifyData {
  userProfile: MockUserProfile;
  topTracks: MockTrack[];
  topArtists: MockArtist[];
  musicIntelligence: MockMusicIntelligence;
  topGenres: string[];
}

const mockDataSets = {
  short_term: {
    userProfile: {
      display_name: "Demo User",
      product: "premium" as const,
      country: "US",
      followers: { total: 1234 },
      id: "demo_user"
    },
    topTracks: [
      {
        id: 'st1',
        name: 'Flowers',
        artist: 'Miley Cyrus',
        popularity: 98,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273f4823b9e5194e3664446b5dd' }],
        external_urls: { spotify: 'https://open.spotify.com/track/0yLdNVWF3Srea0uzk55zFn' }
      },
      {
        id: 'st2',
        name: 'Anti-Hero',
        artist: 'Taylor Swift',
        popularity: 96,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5' }],
        external_urls: { spotify: 'https://open.spotify.com/track/0V3wPSX9ygBnCm8psDIegu' }
      },
      {
        id: 'st3',
        name: 'As It Was',
        artist: 'Harry Styles',
        popularity: 94,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e85259a1cae29a8d91f2093d' }],
        external_urls: { spotify: 'https://open.spotify.com/track/4Dvkj6JhhA12EX05fT7y2e' }
      },
      {
        id: 'st4',
        name: 'Bad Habit',
        artist: 'Steve Lacy',
        popularity: 92,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273aef4a2a1ff64b5d7e1dd6a8d' }],
        external_urls: { spotify: 'https://open.spotify.com/track/4k6Uh1HN7YXmVs2u9krg1A' }
      },
      {
        id: 'st5',
        name: 'Unholy',
        artist: 'Sam Smith ft. Kim Petras',
        popularity: 90,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27320d47aba98d9075e33bb0b97' }],
        external_urls: { spotify: 'https://open.spotify.com/track/3nqQXoyQOWXiESFLlDF1hG' }
      },
      {
        id: 'st6',
        name: 'Creepin\'',
        artist: 'Metro Boomin, The Weeknd, 21 Savage',
        popularity: 89,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2730e7c86e655b14dcde8f7b2d0' }],
        external_urls: { spotify: 'https://open.spotify.com/track/2dHHgzDwk4BJdRwy9uXhTO' }
      }
    ],
    topArtists: [
      {
        id: 'sta1',
        name: 'Taylor Swift',
        genres: ['pop', 'country', 'folk'],
        popularity: 100,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebe672b5f553298dcdccb0e676' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02' }
      },
      {
        id: 'sta2',
        name: 'The Weeknd',
        genres: ['pop', 'r&b', 'alternative r&b'],
        popularity: 97,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ' }
      },
      {
        id: 'sta3',
        name: 'Harry Styles',
        genres: ['pop', 'rock'],
        popularity: 95,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb4bd1e7552c8b8d51183b68e2' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/6KImCVD70vtIoJWnq6nGn3' }
      },
      {
        id: 'sta4',
        name: 'Dua Lipa',
        genres: ['pop', 'dance pop'],
        popularity: 93,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb2a038d3bf875d23e4aeaa84e' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we' }
      },
      {
        id: 'sta5',
        name: 'Bad Bunny',
        genres: ['reggaeton', 'latin trap'],
        popularity: 94,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb442b53773d50e1b9ec2c2092' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/4q3ewBCX7sLwd24euuV69X' }
      },
      {
        id: 'sta6',
        name: 'Olivia Rodrigo',
        genres: ['pop', 'pop rock'],
        popularity: 92,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb84b5515261745e2c9e1e2965' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/1McMsnEElThX1knmY4oliG' }
      }
    ],
    musicIntelligence: {
      mainstreamTaste: 92,
      artistDiversity: 28,
      vintageCollector: 5,
      undergroundTaste: 15,
      recentMusicLover: 95,
      uniqueAlbumsCount: 45
    },
    topGenres: ['pop', 'dance pop', 'electropop', 'indie pop', 'alternative', 'r&b']
  },

  medium_term: {
    userProfile: {
      display_name: "Demo User",
      product: "premium" as const,
      country: "US",
      followers: { total: 1234 },
      id: "demo_user"
    },
    topTracks: [
      {
        id: 'mt1',
        name: 'Blinding Lights',
        artist: 'The Weeknd',
        popularity: 95,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27304878afb19613391ee171e2d' }],
        external_urls: { spotify: 'https://open.spotify.com/track/0VjIjW4GlULA2BxJDUfXuN' }
      },
      {
        id: 'mt2',
        name: 'Good 4 U',
        artist: 'Olivia Rodrigo',
        popularity: 89,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a' }],
        external_urls: { spotify: 'https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG' }
      },
      {
        id: 'mt3',
        name: 'Levitating',
        artist: 'Dua Lipa',
        popularity: 92,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273be841ba4bc24340152e3a79a' }],
        external_urls: { spotify: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9' }
      },
      {
        id: 'mt4',
        name: 'Stay',
        artist: 'The Kid LAROI & Justin Bieber',
        popularity: 91,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e271156d3c8b01d4cb3c2ac1' }],
        external_urls: { spotify: 'https://open.spotify.com/track/5PjdY0CKGZdEuoNab3yDmX' }
      },
      {
        id: 'mt5',
        name: 'Industry Baby',
        artist: 'Lil Nas X & Jack Harlow',
        popularity: 88,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e85259a1cae29a8d91f2093d' }],
        external_urls: { spotify: 'https://open.spotify.com/track/27NovPIUIRrOZoCHxABJwK' }
      },
      {
        id: 'mt6',
        name: 'Heat Waves',
        artist: 'Glass Animals',
        popularity: 87,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273aa9f5208c34b2f37da8abf67' }],
        external_urls: { spotify: 'https://open.spotify.com/track/02MWAaffLxlfxAUY7c5dvx' }
      }
    ],
    topArtists: [
      {
        id: 'mta1',
        name: 'Drake',
        genres: ['canadian hip hop', 'pop rap', 'rap'],
        popularity: 96,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/3TVXtAsR1Inumwj472S9r4' }
      },
      {
        id: 'mta2',
        name: 'Ed Sheeran',
        genres: ['pop', 'singer-songwriter'],
        popularity: 90,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb49a38ea02a1b14d8b7e4f1e6' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/6eUKZXaKkcviH0Ku9w2n3V' }
      },
      {
        id: 'mta3',
        name: 'Billie Eilish',
        genres: ['electropop', 'pop'],
        popularity: 91,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb12e3f20d05a8d6cfde988715' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/6qqNVTkY8uBg9cP3Jd8DAH' }
      },
      {
        id: 'mta4',
        name: 'Post Malone',
        genres: ['dfw rap', 'melodic rap', 'pop'],
        popularity: 89,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb3c8c20f94b9a07a53e97e732' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/246dkjvS1zLTtiykXe5h60' }
      },
      {
        id: 'mta5',
        name: 'Ariana Grande',
        genres: ['dance pop', 'pop'],
        popularity: 88,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebb4f0928c0b0a49c804b2e1b2' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/66CXWjxzNUsdJxJ2JdwvnR' }
      },
      {
        id: 'mta6',
        name: 'Lil Nas X',
        genres: ['lgbtq+ hip hop', 'pop rap'],
        popularity: 86,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb1c5b02e0e0fbbf12a21c0389' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/7jVv8c5Fj3E9VhNjxT4snq' }
      }
    ],
    musicIntelligence: {
      mainstreamTaste: 85,
      artistDiversity: 42,
      vintageCollector: 15,
      undergroundTaste: 25,
      recentMusicLover: 70,
      uniqueAlbumsCount: 89
    },
    topGenres: ['pop', 'r&b', 'hip hop', 'dance', 'rock', 'indie', 'electronic', 'alternative']
  },

  long_term: {
    userProfile: {
      display_name: "Demo User",
      product: "premium" as const,
      country: "US",
      followers: { total: 1234 },
      id: "demo_user"
    },
    topTracks: [
      {
        id: 'lt1',
        name: 'Bohemian Rhapsody',
        artist: 'Queen',
        popularity: 88,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a' }],
        external_urls: { spotify: 'https://open.spotify.com/track/4u7EnebtmKWzUH433cf5Qv' }
      },
      {
        id: 'lt2',
        name: 'Hotel California',
        artist: 'Eagles',
        popularity: 85,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2734637341b9f507521afa9a778' }],
        external_urls: { spotify: 'https://open.spotify.com/track/40riOy7x9W7GXjyGp4pjAv' }
      },
      {
        id: 'lt3',
        name: 'Smells Like Teen Spirit',
        artist: 'Nirvana',
        popularity: 82,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e175a19e530c898d167d39bf' }],
        external_urls: { spotify: 'https://open.spotify.com/track/5ghIJDpPoe3WYdRLWHIm5F' }
      },
      {
        id: 'lt4',
        name: 'Sweet Child O\' Mine',
        artist: 'Guns N\' Roses',
        popularity: 84,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b67b1f57dd43c799c25aec9d' }],
        external_urls: { spotify: 'https://open.spotify.com/track/0gkVD2tr14wCfJhqhdE94L' }
      },
      {
        id: 'lt5',
        name: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        popularity: 80,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2735bff0debfd51b0c4e7fffe58' }],
        external_urls: { spotify: 'https://open.spotify.com/track/5CQ30WqJwcep0pYcV4AMNc' }
      },
      {
        id: 'lt6',
        name: 'Imagine',
        artist: 'John Lennon',
        popularity: 79,
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273baf64f6e2e7dc72a7a6e6a78' }],
        external_urls: { spotify: 'https://open.spotify.com/track/7pKfPomDEeI4TPT6EOYjn9' }
      }
    ],
    topArtists: [
      {
        id: 'lta1',
        name: 'The Beatles',
        genres: ['british invasion', 'merseybeat', 'psychedelic rock'],
        popularity: 85,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb4ce8ab7c2dfbd11a5cf27297' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2' }
      },
      {
        id: 'lta2',
        name: 'Queen',
        genres: ['glam rock', 'rock'],
        popularity: 87,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb03a2297b7ff1e19f580fd51a' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/1dfeR4HaWDbWqFHLkxsg1d' }
      },
      {
        id: 'lta3',
        name: 'Led Zeppelin',
        genres: ['album rock', 'classic rock', 'hard rock'],
        popularity: 83,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb4871e7b33b0e4bf9c0de8609' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/36QJpDe2go2KgaRleHCDTp' }
      },
      {
        id: 'lta4',
        name: 'Pink Floyd',
        genres: ['art rock', 'progressive rock', 'psychedelic rock'],
        popularity: 82,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb19c2790f1c18a8a28c4d2db3' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/0k17h0D3J5VfsdmQ1iZtE9' }
      },
      {
        id: 'lta5',
        name: 'The Rolling Stones',
        genres: ['british invasion', 'classic rock', 'rock'],
        popularity: 81,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb57f148764df1a28fe1c91cf4' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/22bE4uQ6baNwSHPVcDxLCe' }
      },
      {
        id: 'lta6',
        name: 'AC/DC',
        genres: ['australian rock', 'hard rock', 'rock'],
        popularity: 80,
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb1c7ad3f6caed848be68b6ac8' }],
        external_urls: { spotify: 'https://open.spotify.com/artist/711MCceyCBcFnzjGY4Q7Un' }
      }
    ],
    musicIntelligence: {
      mainstreamTaste: 78,
      artistDiversity: 67,
      vintageCollector: 45,
      undergroundTaste: 35,
      recentMusicLover: 30,
      uniqueAlbumsCount: 156
    },
    topGenres: ['rock', 'classic rock', 'pop', 'alternative rock', 'indie', 'folk', 'progressive rock', 'psychedelic rock']
  }
};

export const getDataForTimeRange = (timeRange: 'short_term' | 'medium_term' | 'long_term'): MockSpotifyData => {
  return mockDataSets[timeRange];
};

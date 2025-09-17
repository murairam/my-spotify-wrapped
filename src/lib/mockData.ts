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

const userProfile = {
  display_name: "Demo User",
  product: "premium" as const,
  country: "US",
  followers: { total: 1234 },
  id: "demo_user"
};

const shortTermTracks = [
  {
    id: 'st1',
    name: 'Watermelon Sugar',
    artist: 'Harry Styles',
    popularity: 95,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b2737fcead687e99583072cc217b' },
      { url: 'https://i.scdn.co/image/ab67616d00001e027fcead687e99583072cc217b' },
      { url: 'https://i.scdn.co/image/ab67616d000048517fcead687e99583072cc217b' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/6UelLqGlWMcVH1E5c4H7lY' }
  },
  {
    id: 'st2',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    popularity: 98,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' },
      { url: 'https://i.scdn.co/image/ab67616d00001e028863bc11d2aa12b54f5aeb36' },
      { url: 'https://i.scdn.co/image/ab67616d000048518863bc11d2aa12b54f5aeb36' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/0VjIjW4GlULA2BxJDUfXuN' }
  },
  {
    id: 'st3',
    name: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    popularity: 92,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273a91c10fe9472d9bd89802e5a' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02a91c10fe9472d9bd89802e5a' },
      { url: 'https://i.scdn.co/image/ab67616d00004851a91c10fe9472d9bd89802e5a' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/4ZtFanR9U6ndgddUvNcjcG' }
  },
  {
    id: 'st4',
    name: 'Levitating',
    artist: 'Dua Lipa',
    popularity: 90,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273ef968746a39516c05d3c267b' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02ef968746a39516c05d3c267b' },
      { url: 'https://i.scdn.co/image/ab67616d00004851ef968746a39516c05d3c267b' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9' }
  },
  {
    id: 'st5',
    name: 'Anti-Hero',
    artist: 'Taylor Swift',
    popularity: 96,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02bb54dde68cd23e2a268ae0f5' },
      { url: 'https://i.scdn.co/image/ab67616d00004851bb54dde68cd23e2a268ae0f5' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/0V3wPSX9ygBnCm8psDIegu' }
  },
  {
    id: 'st6',
    name: 'As It Was',
    artist: 'Harry Styles',
    popularity: 94,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0' },
      { url: 'https://i.scdn.co/image/ab67616d00001e022e8ed79e177ff6011076f5f0' },
      { url: 'https://i.scdn.co/image/ab67616d000048512e8ed79e177ff6011076f5f0' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/4Dvkj6JhhA12EX05fT7y2e' }
  }
];

const mediumTermTracks = [
  {
    id: 'mt1',
    name: 'Shape of You',
    artist: 'Ed Sheeran',
    popularity: 94,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6851' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02ba5db46f4b838ef6027e6851' },
      { url: 'https://i.scdn.co/image/ab67616d00004851ba5db46f4b838ef6027e6851' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3' }
  },
  {
    id: 'mt2',
    name: 'Bad Guy',
    artist: 'Billie Eilish',
    popularity: 91,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273a9f6c04ba168640b48aa5795' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02a9f6c04ba168640b48aa5795' },
      { url: 'https://i.scdn.co/image/ab67616d00004851a9f6c04ba168640b48aa5795' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/2Fxmhks0bxGSBdJ92vM42m' }
  },
  {
    id: 'mt3',
    name: 'Circles',
    artist: 'Post Malone',
    popularity: 89,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02b1c4b76e23414c9f20242268' },
      { url: 'https://i.scdn.co/image/ab67616d00004851b1c4b76e23414c9f20242268' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/21jGcNKet2qwijlDFuPiPb' }
  },
  {
    id: 'mt4',
    name: 'Someone You Loved',
    artist: 'Lewis Capaldi',
    popularity: 86,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273fc2101e6889d6ce9025f85f2' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02fc2101e6889d6ce9025f85f2' },
      { url: 'https://i.scdn.co/image/ab67616d00004851fc2101e6889d6ce9025f85f2' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/7qEHsqek33rTcFNT9PFqLf' }
  },
  {
    id: 'mt5',
    name: 'Sunflower',
    artist: 'Post Malone & Swae Lee',
    popularity: 85,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b27335b18b6b95fa2222357f754d' },
      { url: 'https://i.scdn.co/image/ab67616d00001e0235b18b6b95fa2222357f754d' },
      { url: 'https://i.scdn.co/image/ab67616d0000485135b18b6b95fa2222357f754d' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/0RiRZpuVRbi7oqRdSMwhQY' }
  },
  {
    id: 'mt6',
    name: 'Thank U, Next',
    artist: 'Ariana Grande',
    popularity: 84,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273040b2c9849d68d6eb78d75d3' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02040b2c9849d68d6eb78d75d3' },
      { url: 'https://i.scdn.co/image/ab67616d00004851040b2c9849d68d6eb78d75d3' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/3e9HZxeyfWwjeyPAMmWSSQ' }
  }
];

const longTermTracks = [
  {
    id: 'lt1',
    name: 'Bohemian Rhapsody',
    artist: 'Queen',
    popularity: 88,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02ce4f1737bc8a646c8c4bd25a' },
      { url: 'https://i.scdn.co/image/ab67616d00004851ce4f1737bc8a646c8c4bd25a' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/4u7EnebtmKWzUH433cf5Qv' }
  },
  {
    id: 'lt2',
    name: 'Hotel California',
    artist: 'Eagles',
    popularity: 85,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273c5651aedd6e05dc05b734b1b' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02c5651aedd6e05dc05b734b1b' },
      { url: 'https://i.scdn.co/image/ab67616d00004851c5651aedd6e05dc05b734b1b' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/40riOy7x9W7GXjyGp4pjAv' }
  },
  {
    id: 'lt3',
    name: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    popularity: 82,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273c8a11e48c91a982d086afc69' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69' },
      { url: 'https://i.scdn.co/image/ab67616d00004851c8a11e48c91a982d086afc69' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/5CQ30WqJwcep0pYcV4AMNc' }
  },
  {
    id: 'lt4',
    name: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    popularity: 80,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273267b8c91e86b6050dc820fb6' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02267b8c91e86b6050dc820fb6' },
      { url: 'https://i.scdn.co/image/ab67616d00004851267b8c91e86b6050dc820fb6' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/5ghIJDpPoe3WYdRLWHIm5F' }
  },
  {
    id: 'lt5',
    name: 'Billie Jean',
    artist: 'Michael Jackson',
    popularity: 86,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b2732114f2f3a635b7f972d5a1bd' },
      { url: 'https://i.scdn.co/image/ab67616d00001e022114f2f3a635b7f972d5a1bd' },
      { url: 'https://i.scdn.co/image/ab67616d000048512114f2f3a635b7f972d5a1bd' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/5ChkMS8OtdzJeqyybCc9R5' }
  },
  {
    id: 'lt6',
    name: 'Come Together',
    artist: 'The Beatles',
    popularity: 83,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02dc30583ba717007b00cceb25' },
      { url: 'https://i.scdn.co/image/ab67616d00004851dc30583ba717007b00cceb25' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/2EqlS6tkEnglzr7tkKAAYD' }
  }
];

const shortTermArtists = [
  {
    id: 'sta1',
    name: 'Taylor Swift',
    genres: ['pop', 'country', 'folk'],
    popularity: 100,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Midnights_-_Taylor_Swift.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Midnights_-_Taylor_Swift.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Midnights_-_Taylor_Swift.png' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02' }
  },
  {
    id: 'sta2',
    name: 'The Weeknd',
    genres: ['pop', 'r&b'],
    popularity: 97,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ' }
  },
  {
    id: 'sta3',
    name: 'Harry Styles',
    genres: ['pop', 'rock'],
    popularity: 95,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/c/cd/Harry_Styles_-_Harry%27s_House.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/c/cd/Harry_Styles_-_Harry%27s_House.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/c/cd/Harry_Styles_-_Harry%27s_House.png' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/6KImCVD70vtIoJWnq6nGn3' }
  },
  {
    id: 'sta4',
    name: 'Dua Lipa',
    genres: ['pop', 'dance pop'],
    popularity: 93,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/f/f5/Dua_Lipa_-_Future_Nostalgia_%28Official_Album_Cover%29.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/f/f5/Dua_Lipa_-_Future_Nostalgia_%28Official_Album_Cover%29.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/f/f5/Dua_Lipa_-_Future_Nostalgia_%28Official_Album_Cover%29.png' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we' }
  },
  {
    id: 'sta5',
    name: 'Olivia Rodrigo',
    genres: ['pop', 'pop rock'],
    popularity: 91,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/b/b1/Olivia_Rodrigo_-_Sour.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/b/b1/Olivia_Rodrigo_-_Sour.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/b/b1/Olivia_Rodrigo_-_Sour.png' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/1McMsnEElThX1knmY4oliG' }
  },
  {
    id: 'sta6',
    name: 'Post Malone',
    genres: ['pop rap', 'dfw rap'],
    popularity: 89,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/9/9a/Post_Malone_-_Hollywood%27s_Bleeding.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/9/9a/Post_Malone_-_Hollywood%27s_Bleeding.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/9/9a/Post_Malone_-_Hollywood%27s_Bleeding.png' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/246dkjvS1zLTtiykXe5h60' }
  }
];

const mediumTermArtists = [
  {
    id: 'mta1',
    name: 'Tones and I',
    genres: ['indie pop', 'pop'],
    popularity: 78,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5eb7414cdd7b90a9e0e00f50d5b' },
      { url: 'https://i.scdn.co/image/ab676161000051747414cdd7b90a9e0e00f50d5b' },
      { url: 'https://i.scdn.co/image/ab6761610000f1787414cdd7b90a9e0e00f50d5b' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/2NjfBq1NflQcKSeiDooVjY' }
  },
  {
    id: 'mta2',
    name: 'Lil Nas X',
    genres: ['pop rap', 'country rap'],
    popularity: 85,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5eb71e86ec7ee5addf10b8a4bd1' },
      { url: 'https://i.scdn.co/image/ab6761610000517471e86ec7ee5addf10b8a4bd1' },
      { url: 'https://i.scdn.co/image/ab6761610000f17871e86ec7ee5addf10b8a4bd1' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/7jVv8c5Fj3E9VhNjxT4snq' }
  },
  {
    id: 'mta3',
    name: 'Shawn Mendes',
    genres: ['pop', 'singer-songwriter'],
    popularity: 82,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5ebe05d5b0a3e84b8c63671c81d' },
      { url: 'https://i.scdn.co/image/ab67616100005174e05d5b0a3e84b8c63671c81d' },
      { url: 'https://i.scdn.co/image/ab6761610000f178e05d5b0a3e84b8c63671c81d' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/7n2wHs1TKAczGzO7Dd2rGr' }
  },
  {
    id: 'mta4',
    name: 'Imagine Dragons',
    genres: ['pop rock', 'alternative rock'],
    popularity: 84,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5eb920dc1f617550de8388f368e' },
      { url: 'https://i.scdn.co/image/ab67616100005174920dc1f617550de8388f368e' },
      { url: 'https://i.scdn.co/image/ab6761610000f178920dc1f617550de8388f368e' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/53XhwfbYqKCa1cC15pYq2q' }
  },
  {
    id: 'mta5',
    name: 'Camila Cabello',
    genres: ['pop', 'latin pop'],
    popularity: 79,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5eb5ccde7d7ccdb7cf20df0bd96' },
      { url: 'https://i.scdn.co/image/ab676161000051745ccde7d7ccdb7cf20df0bd96' },
      { url: 'https://i.scdn.co/image/ab6761610000f1785ccde7d7ccdb7cf20df0bd96' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/4nDoRrQiYLoBzwC5BhVJzF' }
  },
  {
    id: 'mta6',
    name: 'Mark Ronson',
    genres: ['funk', 'pop', 'alternative hip hop'],
    popularity: 75,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5ebe7f4a693d8ac1e56d1a81e5a' },
      { url: 'https://i.scdn.co/image/ab67616100005174e7f4a693d8ac1e56d1a81e5a' },
      { url: 'https://i.scdn.co/image/ab6761610000f178e7f4a693d8ac1e56d1a81e5a' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/3hv9jJF3adDNsBSIQDqcjp' }
  }
];

const longTermArtists = [
  {
    id: 'lta1',
    name: 'Queen',
    genres: ['rock', 'glam rock'],
    popularity: 87,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Bohemian_Rhapsody.png' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/1dfeR4HaWDbWqFHLkxsg1d' }
  },
  {
    id: 'lta2',
    name: 'The Beatles',
    genres: ['rock', 'british invasion'],
    popularity: 85,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2' }
  },
  {
    id: 'lta3',
    name: 'Led Zeppelin',
    genres: ['rock', 'hard rock'],
    popularity: 83,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/2/26/Led_Zeppelin_-_Led_Zeppelin_IV.jpg' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/2/26/Led_Zeppelin_-_Led_Zeppelin_IV.jpg' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/2/26/Led_Zeppelin_-_Led_Zeppelin_IV.jpg' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/36QJpDe2go2KgaRleHCDTp' }
  },
  {
    id: 'lta4',
    name: 'Eagles',
    genres: ['rock', 'country rock'],
    popularity: 81,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/4/49/Hotel_California.jpg' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/4/49/Hotel_California.jpg' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/4/49/Hotel_California.jpg' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL' }
  },
  {
    id: 'lta5',
    name: 'Michael Jackson',
    genres: ['pop', 'r&b'],
    popularity: 89,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/3fMbdgg4jU18AjLCKBhRSm' }

  },
  {
    id: 'lta6',
    name: 'Nirvana',
    genres: ['grunge', 'rock'],
    popularity: 84,
    images: [
      { url: 'https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg' },
      { url: 'https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/6olE6TJLqED3rqDCT0FyPh' }
  }
];

const mockDataSets = {
  short_term: {
    userProfile: userProfile,
    topTracks: shortTermTracks,
    topArtists: shortTermArtists,
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
    userProfile: userProfile,
    topTracks: mediumTermTracks,
    topArtists: mediumTermArtists,
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
    userProfile: userProfile,
    topTracks: longTermTracks,
    topArtists: longTermArtists,
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

import type { SpotifyData } from '@/types/spotify';

export const getDataForTimeRange = (timeRange: 'short_term' | 'medium_term' | 'long_term'): MockSpotifyData => {
  return mockDataSets[timeRange];
};

// Convert the mock data shape into the SpotifyData shape expected by AI and server logic
export const convertMockToSpotifyData = (mock: MockSpotifyData): SpotifyData => {
  const topTracks = mock.topTracks.map(t => ({
    id: t.id,
    name: t.name,
    artist: t.artist,
    artists: [{ name: t.artist }],
    popularity: t.popularity,
    images: t.images,
    external_urls: t.external_urls,
    album: { name: t.name, release_date: '', images: t.images }
  }));

  const topArtists = mock.topArtists.map(a => ({
    id: a.id,
    name: a.name,
    genres: a.genres,
    popularity: a.popularity,
    images: a.images,
    external_urls: a.external_urls,
  }));

  const spotifyUser = {
    display_name: mock.userProfile.display_name,
    country: mock.userProfile.country,
    followers: mock.userProfile.followers,
    product: mock.userProfile.product
  };

  return {
    topTracks,
    topArtists,
    topGenres: mock.topGenres,
    musicIntelligence: mock.musicIntelligence,
    userProfile: spotifyUser,
    timeRange: ''
  } as SpotifyData;
};


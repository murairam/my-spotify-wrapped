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
      { url: 'https://i.scdn.co/image/ab67616d0000b27377fdcfda6535601aff081b6a' },
      { url: 'https://i.scdn.co/image/ab67616d00001e0277fdcfda6535601aff081b6a' },
      { url: 'https://i.scdn.co/image/ab67616d0000485177fdcfda6535601aff081b6a' }
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
    external_urls: { spotify: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b' }
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
      { url: 'https://i.scdn.co/image/ab67616d0000b2732172b607853fa89cefa2beb4' },
      { url: 'https://i.scdn.co/image/ab67616d00001e022172b607853fa89cefa2beb4' },
      { url: 'https://i.scdn.co/image/ab67616d000048512172b607853fa89cefa2beb4' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/5nujrmhLynf4yMoMtj8AQF' }
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
      { url: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02ba5db46f4b838ef6027e6f96' },
      { url: 'https://i.scdn.co/image/ab67616d00004851ba5db46f4b838ef6027e6f96' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3' }
  },
  {
    id: 'mt2',
    name: 'Bad Guy',
    artist: 'Billie Eilish',
    popularity: 91,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b27350a3147b4edd7701a876c6ce' },
      { url: 'https://i.scdn.co/image/ab67616d00001e0250a3147b4edd7701a876c6ce' },
      { url: 'https://i.scdn.co/image/ab67616d0000485150a3147b4edd7701a876c6ce' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/2Fxmhks0bxGSBdJ92vM42m' }
  },
  {
    id: 'mt3',
    name: 'Circles',
    artist: 'Post Malone',
    popularity: 89,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b2739478c87599550dd73bfa7e02' },
      { url: 'https://i.scdn.co/image/ab67616d00001e029478c87599550dd73bfa7e02' },
      { url: 'https://i.scdn.co/image/ab67616d000048519478c87599550dd73bfa7e02' }
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
      { url: 'https://i.scdn.co/image/ab67616d0000b273e2e352d89826aef6dbd5ff8f' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02e2e352d89826aef6dbd5ff8f' },
      { url: 'https://i.scdn.co/image/ab67616d00004851e2e352d89826aef6dbd5ff8f' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/3KkXRkHbMCARz0aVfEt68P' }
  },
  {
    id: 'mt6',
    name: 'Thank U, Next',
    artist: 'Ariana Grande',
    popularity: 84,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b27356ac7b86e090f307e218e9c8' },
      { url: 'https://i.scdn.co/image/ab67616d00001e0256ac7b86e090f307e218e9c8' },
      { url: 'https://i.scdn.co/image/ab67616d0000485156ac7b86e090f307e218e9c8' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/6ocbgoVGwYJhOv1GgI9NsF' }
  }
];

const longTermTracks = [
  {
    id: 'lt1',
    name: 'Bohemian Rhapsody',
    artist: 'Queen',
    popularity: 88,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273e319baafd16e84f0408af2a0' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02e319baafd16e84f0408af2a0' },
      { url: 'https://i.scdn.co/image/ab67616d00004851e319baafd16e84f0408af2a0' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/4u7EnebtmKWzUH433cf5Qv' }
  },
  {
    id: 'lt2',
    name: 'Hotel California',
    artist: 'Eagles',
    popularity: 85,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b2734637341b9f507521afa9a778' },
      { url: 'https://i.scdn.co/image/ab67616d00001e024637341b9f507521afa9a778' },
      { url: 'https://i.scdn.co/image/ab67616d000048514637341b9f507521afa9a778' }
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
      { url: 'https://i.scdn.co/image/ab67616d0000b273fbc71c99f9c1296c56dd51b6' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02fbc71c99f9c1296c56dd51b6' },
      { url: 'https://i.scdn.co/image/ab67616d00004851fbc71c99f9c1296c56dd51b6' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/4CeeEOM32jQcH3eN9Q2dGj' }
  },
  {
    id: 'lt5',
    name: 'Billie Jean',
    artist: 'Michael Jackson',
    popularity: 86,
    images: [
      { url: 'https://i.scdn.co/image/ab67616d0000b273de437d960dda1ac0a3586d97' },
      { url: 'https://i.scdn.co/image/ab67616d00001e02de437d960dda1ac0a3586d97' },
      { url: 'https://i.scdn.co/image/ab67616d00004851de437d960dda1ac0a3586d97' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/track/7J1uxwnxfQLu4APicE5Rnj' }
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
      { url: 'https://i.scdn.co/image/ab6761610000e5ebe672b5f553298dcdccb0e676' },
      { url: 'https://i.scdn.co/image/ab67616100005174e672b5f553298dcdccb0e676' },
      { url: 'https://i.scdn.co/image/ab6761610000f178e672b5f553298dcdccb0e676' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02' }
  },
  {
    id: 'sta2',
    name: 'The Weeknd',
    genres: ['pop', 'r&b'],
    popularity: 97,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5eb9e528993a2820267b97f6aae' },
      { url: 'https://i.scdn.co/image/ab676161000051749e528993a2820267b97f6aae' },
      { url: 'https://i.scdn.co/image/ab6761610000f1789e528993a2820267b97f6aae' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ' }
  },
  {
    id: 'sta3',
    name: 'Harry Styles',
    genres: ['pop', 'rock'],
    popularity: 95,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5ebf7db7c8ede90a019c54590bb' },
      { url: 'https://i.scdn.co/image/ab67616100005174f7db7c8ede90a019c54590bb' },
      { url: 'https://i.scdn.co/image/ab6761610000f178f7db7c8ede90a019c54590bb' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/6KImCVD70vtIoJWnq6nGn3' }
  },
  {
    id: 'sta4',
    name: 'Dua Lipa',
    genres: ['pop', 'dance pop'],
    popularity: 93,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5eb0c68f6c95232e716f0abee8d' },
      { url: 'https://i.scdn.co/image/ab676161000051740c68f6c95232e716f0abee8d' },
      { url: 'https://i.scdn.co/image/ab6761610000f1780c68f6c95232e716f0abee8d' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we' }
  },
  {
    id: 'sta5',
    name: 'Olivia Rodrigo',
    genres: ['pop', 'pop rock'],
    popularity: 91,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5ebe03a98785f3658f0b6461ec4' },
      { url: 'https://i.scdn.co/image/ab67616100005174e03a98785f3658f0b6461ec4' },
      { url: 'https://i.scdn.co/image/ab6761610000f178e03a98785f3658f0b6461ec4' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/1McMsnEElThX1knmY4oliG' }
  },
  {
    id: 'sta6',
    name: 'Post Malone',
    genres: ['pop rap', 'dfw rap'],
    popularity: 89,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5ebe17c0aa1714a03d62b5ce4e0' },
      { url: 'https://i.scdn.co/image/ab67616100005174e17c0aa1714a03d62b5ce4e0' },
      { url: 'https://i.scdn.co/image/ab6761610000f178e17c0aa1714a03d62b5ce4e0' }
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
      { url: 'https://i.scdn.co/image/ab6761610000e5eb8bbb776368161a8258cbca3a' },
      { url: 'https://i.scdn.co/image/ab676161000051748bbb776368161a8258cbca3a' },
      { url: 'https://i.scdn.co/image/ab6761610000f1788bbb776368161a8258cbca3a' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/2NjfBq1NflQcKSeiDooVjY' }
  },
  {
    id: 'mta2',
    name: 'Lil Nas X',
    genres: ['pop rap', 'country rap'],
    popularity: 85,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5eb3758a33e782b46bd7f174e1d' },
      { url: 'https://i.scdn.co/image/ab676161000051743758a33e782b46bd7f174e1d' },
      { url: 'https://i.scdn.co/image/ab6761610000f1783758a33e782b46bd7f174e1d' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/7jVv8c5Fj3E9VhNjxT4snq' }
  },
  {
    id: 'mta3',
    name: 'Shawn Mendes',
    genres: ['pop', 'singer-songwriter'],
    popularity: 82,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5eb58b4b9419486550f6fda0535' },
      { url: 'https://i.scdn.co/image/ab6761610000517458b4b9419486550f6fda0535' },
      { url: 'https://i.scdn.co/image/ab6761610000f17858b4b9419486550f6fda0535' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/7n2wHs1TKAczGzO7Dd2rGr' }
  },
  {
    id: 'mta4',
    name: 'Imagine Dragons',
    genres: ['pop rock', 'alternative rock'],
    popularity: 84,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5ebab47d8dae2b24f5afe7f9d38' },
      { url: 'https://i.scdn.co/image/ab67616100005174ab47d8dae2b24f5afe7f9d38' },
      { url: 'https://i.scdn.co/image/ab6761610000f178ab47d8dae2b24f5afe7f9d38' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/53XhwfbYqKCa1cC15pYq2q' }
  },
  {
    id: 'mta5',
    name: 'Camila Cabello',
    genres: ['pop', 'latin pop'],
    popularity: 79,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5eb76470faf6330235edbcb90a9' },
      { url: 'https://i.scdn.co/image/ab6761610000517476470faf6330235edbcb90a9' },
      { url: 'https://i.scdn.co/image/ab6761610000f17876470faf6330235edbcb90a9' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/4nDoRrQiYLoBzwC5BhVJzF' }
  },
  {
    id: 'mta6',
    name: 'Mark Ronson',
    genres: ['funk', 'pop', 'alternative hip hop'],
    popularity: 75,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5eb105cc9628c315b29d299fbb4' },
      { url: 'https://i.scdn.co/image/ab67616100005174105cc9628c315b29d299fbb4' },
      { url: 'https://i.scdn.co/image/ab6761610000f178105cc9628c315b29d299fbb4' }
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
      { url: 'https://i.scdn.co/image/b040846ceba13c3e9c125d68389491094e7f2982' },
      { url: 'https://i.scdn.co/image/af2b8e57f6d7b5d43a616bd1e27ba552cd8bfd42' },
      { url: 'https://i.scdn.co/image/c06971e9ff81696699b829484e3be165f4e64368' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/1dfeR4HaWDbWqFHLkxsg1d' }
  },
  {
    id: 'lta2',
    name: 'The Beatles',
    genres: ['rock', 'british invasion'],
    popularity: 85,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5ebe9348cc01ff5d55971b22433' },
      { url: 'https://i.scdn.co/image/ab67616100005174e9348cc01ff5d55971b22433' },
      { url: 'https://i.scdn.co/image/ab6761610000f178e9348cc01ff5d55971b22433' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2' }
  },
  {
    id: 'lta3',
    name: 'Led Zeppelin',
    genres: ['rock', 'hard rock'],
    popularity: 83,
    images: [
      { url: 'https://i.scdn.co/image/207803ce008388d3427a685254f9de6a8f61dc2e' },
      { url: 'https://i.scdn.co/image/b0248a44865493e6a03832aa89854ada16ff07a8' },
      { url: 'https://i.scdn.co/image/16eb3cdae0d824b520ac17710e943a99d3ef6602' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/36QJpDe2go2KgaRleHCDTp' }
  },
  {
    id: 'lta4',
    name: 'Eagles',
    genres: ['rock', 'country rock'],
    popularity: 81,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5eb0767e116a2307495e37cd7fb' },
      { url: 'https://i.scdn.co/image/ab676161000051740767e116a2307495e37cd7fb' },
      { url: 'https://i.scdn.co/image/ab6761610000f1780767e116a2307495e37cd7fb' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/0ECwFtbIWEVNwjlrfc6xoL' }
  },
  {
    id: 'lta5',
    name: 'Michael Jackson',
    genres: ['pop', 'r&b'],
    popularity: 89,
    images: [
      { url: 'https://i.scdn.co/image/ab6761610000e5eb997cc9a4aec335d46c9481fd' },
      { url: 'https://i.scdn.co/image/ab67616100005174997cc9a4aec335d46c9481fd' },
      { url: 'https://i.scdn.co/image/ab6761610000f178997cc9a4aec335d46c9481fd' }
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/3fMbdgg4jU18AjLCKBhRSm' }
  },
  {
    id: 'lta6',
    name: 'Nirvana',
    genres: ['grunge', 'rock'],
    popularity: 84,
    images: [
      { url: 'https://i.scdn.co/image/84282c28d851a700132356381fcfbadc67ff498b' },
      { url: 'https://i.scdn.co/image/a4e10b79a642e9891383448cbf37d7266a6883d6' },
      { url: 'https://i.scdn.co/image/42ae0f180f16e2f21c1f2212717fc436f5b95451' }
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


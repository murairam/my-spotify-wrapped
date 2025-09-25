// scripts/fetchRecentlyPlayedImages.js
// Fetches correct Spotify album cover images for a list of tracks using the Spotify Web API
// Usage: node scripts/fetchRecentlyPlayedImages.js

const fs = require('fs');
const fetch = require('node-fetch');


// Accept credentials from command line or fallback to placeholders
const CLIENT_ID = process.argv[2] || 'YOUR_SPOTIFY_CLIENT_ID';
const CLIENT_SECRET = process.argv[3] || 'YOUR_SPOTIFY_CLIENT_SECRET';

// Remove text in parentheses and trim
function cleanTitle(title) {
  return title.replace(/\(.*?\)/g, '').replace(/feat\..*/i, '').trim();
}

// 2. List your recently played tracks here (cleaned for better matching)
const tracks = [
  { name: 'Anti-Hero', artist: 'Taylor Swift' },
  { name: 'Flowers', artist: 'Miley Cyrus' },
  { name: 'Good 4 U', artist: 'Olivia Rodrigo' },
  { name: 'Levitating', artist: 'Dua Lipa' },
  { name: 'Watermelon Sugar', artist: 'Harry Styles' },
  { name: 'Blinding Lights', artist: 'The Weeknd' },
  { name: 'As It Was', artist: 'Harry Styles' },
  { name: 'Shape of You', artist: 'Ed Sheeran' },
  { name: 'Vampire', artist: 'Olivia Rodrigo' },
  { name: 'Seven', artist: 'Jung Kook' },
  { name: 'Cruel Summer', artist: 'Taylor Swift' },
  { name: 'Kill Bill', artist: 'SZA' },
  { name: 'Unholy', artist: 'Sam Smith' },
  { name: 'About Damn Time', artist: 'Lizzo' },
  { name: 'Heat Waves', artist: 'Glass Animals' }
];

async function getAccessToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });
  const data = await res.json();
  return data.access_token;
}


async function fetchTrackData(track, token) {
  const cleanName = cleanTitle(track.name);
  const q = encodeURIComponent(`${cleanName} ${track.artist}`);
  const url = `https://api.spotify.com/v1/search?q=${q}&type=track&limit=3`;
  const res = await fetch(url, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
    // Try to find the best match by artist
    let t = data.tracks.items.find(item => item.artists.some(a => a.name.toLowerCase().includes(track.artist.toLowerCase())));
    if (!t) t = data.tracks.items[0];
    return {
      name: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      album: t.album.name,
      image: t.album.images[0]?.url || null,
      spotify_url: t.external_urls.spotify,
      album_url: t.album.external_urls.spotify
    };
  } else {
    return { ...track, error: 'Not found' };
  }
}

(async () => {
  const token = await getAccessToken();
  const results = [];
  for (const track of tracks) {
    const data = await fetchTrackData(track, token);
    results.push(data);
    console.log(data);
  }
  fs.writeFileSync('scripts/recently-played-images.json', JSON.stringify(results, null, 2));
  console.log('Done! Output written to scripts/recently-played-images.json');
})();

// Usage: node scripts/fetchSpotifyMockData.js <SPOTIFY_CLIENT_ID> <SPOTIFY_CLIENT_SECRET>
// This script fetches real Spotify images/links for tracks and albums in your mockData.ts

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const MOCKDATA_PATH = path.join(__dirname, '../src/lib/mockData.ts');

async function getSpotifyToken(clientId, clientSecret) {
  const resp = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
    }
  );
  return resp.data.access_token;
}

async function searchSpotify(query, type, token) {
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=1`;
  const resp = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return resp.data[type + 's']?.items?.[0] || null;
}

function extractMockTracksAndAlbums(mockData) {
  // Very basic parse: look for id, name, artist, images, ...
  const trackRegex = /{\s*id: '([^']+)',\s*name: '([^']+)',\s*artist: '([^']+)'/g;
  const tracks = [];
  let match;
  while ((match = trackRegex.exec(mockData))) {
    tracks.push({ id: match[1], name: match[2], artist: match[3] });
  }
  return tracks;
}

function extractMockArtists(mockData) {
  // Look for id, name, genres, popularity, images, ...
  const artistRegex = /{\s*id: '([^']+)',\s*name: '([^']+)',\s*genres: \[[^\]]*\],\s*popularity: (\d+),/g;
  const artists = [];
  let match;
  while ((match = artistRegex.exec(mockData))) {
    artists.push({ id: match[1], name: match[2] });
  }
  return artists;
}

async function main() {
  const [,, clientId, clientSecret] = process.argv;
  if (!clientId || !clientSecret) {
    console.error('Usage: node fetchSpotifyMockData.js <SPOTIFY_CLIENT_ID> <SPOTIFY_CLIENT_SECRET>');
    process.exit(1);
  }
  const token = await getSpotifyToken(clientId, clientSecret);
  const mockData = fs.readFileSync(MOCKDATA_PATH, 'utf8');
  const tracks = extractMockTracksAndAlbums(mockData);
  const artists = extractMockArtists(mockData);

  // Tracks output (as before)
  const out = [];
  for (const t of tracks) {
    let track = await searchSpotify(`${t.name} artist:${t.artist}`, 'track', token);
    if (!track) {
      track = await searchSpotify(t.name, 'track', token);
    }
    if (track) {
      out.push({
        id: t.id,
        name: t.name,
        artist: t.artist,
        images: track.album?.images || [],
        external_urls: track.external_urls,
        album: track.album?.name,
        album_images: track.album?.images || [],
        album_url: track.album?.external_urls?.spotify,
      });
    } else {
      out.push({
        id: t.id,
        name: t.name,
        artist: t.artist,
        images: [],
        external_urls: {},
        album: '',
        album_images: [],
        album_url: '',
        note: 'NOT FOUND ON SPOTIFY',
      });
    }
  }
  fs.writeFileSync(
    path.join(__dirname, 'spotify-mock-output.json'),
    JSON.stringify(out, null, 2)
  );
  console.log('Done! Output written to scripts/spotify-mock-output.json');

  // Artists output
  const artistOut = [];
  for (const a of artists) {
    let artist = await searchSpotify(a.name, 'artist', token);
    if (artist) {
      artistOut.push({
        id: a.id,
        name: a.name,
        images: artist.images || [],
        external_urls: artist.external_urls || {},
      });
    } else {
      artistOut.push({
        id: a.id,
        name: a.name,
        images: [],
        external_urls: {},
        note: 'NOT FOUND ON SPOTIFY',
      });
    }
  }
  fs.writeFileSync(
    path.join(__dirname, 'spotify-mock-output-artists.json'),
    JSON.stringify(artistOut, null, 2)
  );
  console.log('Done! Output written to scripts/spotify-mock-output-artists.json');
}

main().catch(e => { console.error(e); process.exit(1); });

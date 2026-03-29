import { Injectable } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';

@Injectable()
export class SpotifyService {
  async getTopItems(accessToken: string, timeRange: string = 'short_term', limit: number = 50) {
    const spotifyApi = new SpotifyWebApi();
    spotifyApi.setAccessToken(accessToken);
    try {
      const [userProfile, topTracks, topArtists, recentlyPlayed] = await Promise.all([
        spotifyApi.getMe(),
        spotifyApi.getMyTopTracks({ limit, time_range: timeRange as 'short_term' | 'medium_term' | 'long_term' }),
        spotifyApi.getMyTopArtists({ limit, time_range: timeRange as 'short_term' | 'medium_term' | 'long_term' }),
        spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 })
      ]);

      const formatTrackData = (tracks: { body: { items: SpotifyApi.TrackObjectFull[] } }, timeRange: string) =>
        tracks.body.items.slice(0, limit).map((track: SpotifyApi.TrackObjectFull, index: number) => ({
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          artists: track.artists,
          album: {
            name: track.album.name,
            release_date: track.album.release_date,
            images: track.album.images
          },
          popularity: track.popularity,
          external_urls: { spotify: track.external_urls?.spotify },
          images: track.album.images,
          rank: index + 1,
          timeRange
        }));
      const formatArtistData = (artists: { body: { items: SpotifyApi.ArtistObjectFull[] } }, timeRange: string) =>
        artists.body.items.slice(0, limit).map((artist: SpotifyApi.ArtistObjectFull, index: number) => ({
          id: artist.id,
          name: artist.name,
          genres: artist.genres,
          popularity: artist.popularity,
          images: artist.images,
          external_urls: { spotify: artist.external_urls?.spotify },
          followers: artist.followers,
          rank: index + 1,
          timeRange
        }));
      const tracks = formatTrackData(topTracks, timeRange);
      const mainstreamTaste = tracks.length > 0 ? Math.round(tracks.reduce((sum, t) => sum + (t.popularity || 0), 0) / tracks.length) : 0;
      const uniqueArtists = new Set(tracks.map(t => t.artist)).size;
      const vintageCount = tracks.filter(t => t.album && t.album.release_date && t.album.release_date.slice(0,4) < '2010').length;
      const vintageCollector = tracks.length > 0 ? Math.round((vintageCount / tracks.length) * 100) : 0;
      const undergroundCount = tracks.filter(t => (t.popularity || 0) < 40).length;
      const undergroundTaste = tracks.length > 0 ? Math.round((undergroundCount / tracks.length) * 100) : 0;
      const recentCount = tracks.filter(t => t.album && t.album.release_date && t.album.release_date.slice(0,4) >= '2020').length;
      const recentMusicLover = tracks.length > 0 ? Math.round((recentCount / tracks.length) * 100) : 0;
      const uniqueAlbums = new Set(tracks.map(t => t.album?.name)).size;
      const years = tracks
        .map(t => t.album && t.album.release_date ? parseInt(t.album.release_date.slice(0,4)) : undefined)
        .filter((y): y is number => typeof y === 'number' && !isNaN(y));
      const oldestTrackYear = years.length > 0 ? Math.min(...years) : undefined;
      const newestTrackYear = years.length > 0 ? Math.max(...years) : undefined;
      const discoveryMetrics = {
        mainstreamTaste,
        artistDiversity: uniqueArtists,
        vintageCollector,
        undergroundTaste,
        recentMusicLover,
        uniqueArtistsCount: uniqueArtists,
        uniqueAlbumsCount: uniqueAlbums,
        oldestTrackYear,
        newestTrackYear
      };
      const recentTracks = (recentlyPlayed?.body?.items || []).slice(0, 20).map((item: SpotifyApi.PlayHistoryObject) => {
        const t = item.track;
        return {
          track: {
            ...t,
            artist: t.artists && t.artists[0] ? t.artists[0].name : undefined,
            images: t.album?.images || [],
            preview_url: t.preview_url ?? null
          },
          played_at: item.played_at
        };
      });
      return {
        userProfile: userProfile.body,
        topTracks: tracks.slice(0, 10),
        topArtists: formatArtistData(topArtists, timeRange).slice(0, 10),
        discoveryMetrics,
        recentTracks
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch Spotify data');
    }
  }
}

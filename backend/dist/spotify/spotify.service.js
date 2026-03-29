"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyService = void 0;
const common_1 = require("@nestjs/common");
const SpotifyWebApi = require('spotify-web-api-node');
let SpotifyService = class SpotifyService {
    async getTopItems(accessToken, timeRange = 'short_term', limit = 50) {
        var _a;
        const spotifyApi = new SpotifyWebApi();
        spotifyApi.setAccessToken(accessToken);
        try {
            const [userProfile, topTracks, topArtists, recentlyPlayed] = await Promise.all([
                spotifyApi.getMe(),
                spotifyApi.getMyTopTracks({ limit, time_range: timeRange }),
                spotifyApi.getMyTopArtists({ limit, time_range: timeRange }),
                spotifyApi.getMyRecentlyPlayedTracks({ limit: 20 })
            ]);
            const formatTrackData = (tracks, timeRange) => tracks.body.items.slice(0, limit).map((track, index) => {
                var _a;
                return ({
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
                    external_urls: { spotify: (_a = track.external_urls) === null || _a === void 0 ? void 0 : _a.spotify },
                    images: track.album.images,
                    rank: index + 1,
                    timeRange
                });
            });
            const formatArtistData = (artists, timeRange) => artists.body.items.slice(0, limit).map((artist, index) => {
                var _a;
                return ({
                    id: artist.id,
                    name: artist.name,
                    genres: artist.genres,
                    popularity: artist.popularity,
                    images: artist.images,
                    external_urls: { spotify: (_a = artist.external_urls) === null || _a === void 0 ? void 0 : _a.spotify },
                    followers: artist.followers,
                    rank: index + 1,
                    timeRange
                });
            });
            const tracks = formatTrackData(topTracks, timeRange);
            const mainstreamTaste = tracks.length > 0 ? Math.round(tracks.reduce((sum, t) => sum + (t.popularity || 0), 0) / tracks.length) : 0;
            const uniqueArtists = new Set(tracks.map(t => t.artist)).size;
            const vintageCount = tracks.filter(t => t.album && t.album.release_date && t.album.release_date.slice(0, 4) < '2010').length;
            const vintageCollector = tracks.length > 0 ? Math.round((vintageCount / tracks.length) * 100) : 0;
            const undergroundCount = tracks.filter(t => (t.popularity || 0) < 40).length;
            const undergroundTaste = tracks.length > 0 ? Math.round((undergroundCount / tracks.length) * 100) : 0;
            const recentCount = tracks.filter(t => t.album && t.album.release_date && t.album.release_date.slice(0, 4) >= '2020').length;
            const recentMusicLover = tracks.length > 0 ? Math.round((recentCount / tracks.length) * 100) : 0;
            const uniqueAlbums = new Set(tracks.map(t => { var _a; return (_a = t.album) === null || _a === void 0 ? void 0 : _a.name; })).size;
            const years = tracks
                .map(t => t.album && t.album.release_date ? parseInt(t.album.release_date.slice(0, 4)) : undefined)
                .filter((y) => typeof y === 'number' && !isNaN(y));
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
            const recentTracks = (((_a = recentlyPlayed === null || recentlyPlayed === void 0 ? void 0 : recentlyPlayed.body) === null || _a === void 0 ? void 0 : _a.items) || []).slice(0, 20).map((item) => {
                var _a, _b;
                const t = item.track;
                return {
                    track: Object.assign(Object.assign({}, t), { artist: t.artists && t.artists[0] ? t.artists[0].name : undefined, images: ((_a = t.album) === null || _a === void 0 ? void 0 : _a.images) || [], preview_url: (_b = t.preview_url) !== null && _b !== void 0 ? _b : null }),
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
        }
        catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Failed to fetch Spotify data');
        }
    }
};
exports.SpotifyService = SpotifyService;
exports.SpotifyService = SpotifyService = __decorate([
    (0, common_1.Injectable)()
], SpotifyService);
//# sourceMappingURL=spotify.service.js.map
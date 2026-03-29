export declare class SpotifyService {
    getTopItems(accessToken: string, timeRange?: string, limit?: number): Promise<{
        userProfile: SpotifyApi.CurrentUsersProfileResponse;
        topTracks: {
            id: any;
            name: any;
            artist: any;
            artists: any;
            album: {
                name: any;
                release_date: any;
                images: any;
            };
            popularity: any;
            external_urls: {
                spotify: any;
            };
            images: any;
            rank: number;
            timeRange: string;
        }[];
        topArtists: {
            id: any;
            name: any;
            genres: any;
            popularity: any;
            images: any;
            external_urls: {
                spotify: any;
            };
            followers: any;
            rank: number;
            timeRange: string;
        }[];
        discoveryMetrics: {
            mainstreamTaste: number;
            artistDiversity: number;
            vintageCollector: number;
            undergroundTaste: number;
            recentMusicLover: number;
            uniqueArtistsCount: number;
            uniqueAlbumsCount: number;
            oldestTrackYear: number | undefined;
            newestTrackYear: number | undefined;
        };
        recentTracks: {
            track: any;
            played_at: any;
        }[];
    }>;
}

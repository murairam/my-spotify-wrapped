import { SpotifyService } from './spotify.service';
import SpotifyWebApi from 'spotify-web-api-node';

jest.mock('spotify-web-api-node');

const mockTrack = {
  id: '1', name: 'Anti-Hero', popularity: 90, preview_url: null,
  artists: [{ id: 'a1', name: 'Taylor Swift', external_urls: { spotify: '' } }],
  album: { name: 'Midnights', release_date: '2022-10-21', images: [{ url: '' }] },
  external_urls: { spotify: '' },
  duration_ms: 200000, explicit: false, type: 'track', uri: '',
};

const mockArtist = {
  id: 'a1', name: 'Taylor Swift', genres: ['pop'], popularity: 95,
  images: [{ url: '' }], followers: { total: 1000000 },
  external_urls: { spotify: '' }, type: 'artist', uri: '',
};

const mockRecentItem = {
  track: { ...mockTrack, artists: [{ id: 'a1', name: 'Taylor Swift', external_urls: { spotify: '' } }] },
  played_at: '2024-01-15T10:00:00Z',
  context: null,
};

beforeEach(() => {
  const MockSpotifyWebApi = SpotifyWebApi as jest.MockedClass<typeof SpotifyWebApi>;
  MockSpotifyWebApi.mockImplementation(() => ({
    setAccessToken: jest.fn(),
    getMe: jest.fn().mockResolvedValue({ body: { display_name: 'Test User', country: 'US', followers: { total: 10 }, product: 'premium' } }),
    getMyTopTracks: jest.fn().mockResolvedValue({ body: { items: [mockTrack] } }),
    getMyTopArtists: jest.fn().mockResolvedValue({ body: { items: [mockArtist] } }),
    getMyRecentlyPlayedTracks: jest.fn().mockResolvedValue({ body: { items: [mockRecentItem] } }),
  } as unknown as SpotifyWebApi));
});

describe('SpotifyService', () => {
  let service: SpotifyService;

  beforeEach(() => {
    service = new SpotifyService();
  });

  it('should return top tracks', async () => {
    const result = await service.getTopItems('test-token');
    expect(result).toEqual(
      expect.objectContaining({
        topTracks: expect.arrayContaining([
          expect.objectContaining({ name: 'Anti-Hero' }),
        ]),
      })
    );
  });
});

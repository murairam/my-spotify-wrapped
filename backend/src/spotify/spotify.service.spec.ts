import { SpotifyService } from './spotify.service';

describe('SpotifyService', () => {
  let service: SpotifyService;

  beforeEach(() => {
    service = new SpotifyService();
  });

  it('should return top tracks', async () => {
    const result = await service.getTopItems('tracks');
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Anti-Hero' }),
      ])
    );
  });
});

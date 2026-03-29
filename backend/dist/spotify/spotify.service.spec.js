"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spotify_service_1 = require("./spotify.service");
describe('SpotifyService', () => {
    let service;
    beforeEach(() => {
        service = new spotify_service_1.SpotifyService();
    });
    it('should return top tracks', async () => {
        const result = await service.getTopItems('tracks');
        expect(result).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'Anti-Hero' }),
        ]));
    });
});
//# sourceMappingURL=spotify.service.spec.js.map
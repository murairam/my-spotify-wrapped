"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyController = void 0;
const common_1 = require("@nestjs/common");
const spotify_service_1 = require("./spotify.service");
let SpotifyController = class SpotifyController {
    constructor(spotifyService) {
        this.spotifyService = spotifyService;
    }
    async getTopItems(timeRange, limit, req) {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Not authenticated');
        }
        const accessToken = authHeader.replace('Bearer ', '');
        const safeTimeRange = timeRange || 'short_term';
        const safeLimit = limit ? parseInt(limit) : 50;
        try {
            return await this.spotifyService.getTopItems(accessToken, safeTimeRange, safeLimit);
        }
        catch (error) {
            const message = (error && typeof error === 'object' && 'message' in error) ? error.message : 'Failed to fetch Spotify data';
            throw new common_1.InternalServerErrorException(message);
        }
    }
};
exports.SpotifyController = SpotifyController;
__decorate([
    (0, common_1.Get)('top-items'),
    __param(0, (0, common_1.Query)('time_range')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SpotifyController.prototype, "getTopItems", null);
exports.SpotifyController = SpotifyController = __decorate([
    (0, common_1.Controller)('spotify'),
    __metadata("design:paramtypes", [spotify_service_1.SpotifyService])
], SpotifyController);
//# sourceMappingURL=spotify.controller.js.map
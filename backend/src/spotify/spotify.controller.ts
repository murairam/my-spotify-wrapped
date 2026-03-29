
import { Controller, Get, Query, Req, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { Request } from 'express';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('top-items')
  async getTopItems(
    @Query('time_range') timeRange: string,
    @Query('limit') limit: string,
    @Req() req: Request
  ) {
    // Expects accessToken in Authorization header as Bearer token
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Not authenticated');
    }
    const accessToken = authHeader.replace('Bearer ', '');
    const safeTimeRange = timeRange || 'short_term';
    const safeLimit = limit ? parseInt(limit) : 50;
    try {
      return await this.spotifyService.getTopItems(accessToken, safeTimeRange, safeLimit);
    } catch (error) {
      const message = (error && typeof error === 'object' && 'message' in error) ? (error as any).message : 'Failed to fetch Spotify data';
      throw new InternalServerErrorException(message);
    }
  }
}

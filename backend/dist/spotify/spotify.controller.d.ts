import { SpotifyService } from './spotify.service';
import { Request, Response } from 'express';
export declare class SpotifyController {
    private readonly spotifyService;
    constructor(spotifyService: SpotifyService);
    getTopItems(timeRange: string | undefined, limit: string | undefined, req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}

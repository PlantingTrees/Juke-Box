// src/controllers/JukeboxController.ts
import { Request, Response } from 'express';
import { Song } from '../types/CoveyTownSocket';
import { searchSpotifyTracks } from '../services/JukeboxService';

/** Controller for handling Spotify search requests */
export const spotifySearchController = async (req: Request, res: Response): Promise<Response> => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const searchResults = await searchSpotifyTracks(query as string);
    return res.json(searchResults);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch tracks from Spotify' });
  }
};

export default class JukeboxController {
  localQueue: Song[];

  constructor() {
    this.localQueue = [];
  }

  // eslint-disable-next-line class-methods-use-this
  public isSongPlaying(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  public adjustVolume(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }

  addToQueue(song: Song): void {
    this.localQueue.push(song);
  }

  public removeFromQueue(): void {
    this.localQueue.shift();
  }

  static voteToSkip(): void {}
}
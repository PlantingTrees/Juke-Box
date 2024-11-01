// src/controllers/JukeboxController.ts

import { Request, Response } from 'express';
import { searchSpotifyTracks } from '../services/JukeboxService';

/** Controller for handling Spotify search requests */
const spotifySearchController = async (req: Request, res: Response): Promise<Response> => {
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

export default spotifySearchController;

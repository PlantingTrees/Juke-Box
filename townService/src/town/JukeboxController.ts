// src/controllers/JukeboxController.ts

import { Request, Response } from 'express';
import { searchSpotifyTracks } from '../services/JukeboxService';
import { Song } from '../types/CoveyTownSocket';


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

export  default spotifySearchController;



///interface for jukebox
export class JukeboxController {
  localQueue: Song[];
  constructor(totalSize: number) {
    this.localQueue = [];
  }
  isSongPlaying(): boolean { return false;}

  adjustVolume(volume: number): void{
    const town_volume = volume;
    console.log("Volume has been implemented");
  }
 
  addToQueue(songName: Song): void{
    this.localQueue.push(songName);
  }
  // voteToSkip(): void{
  //   //todo
  // }

  async songSearch(req: Request, res: Response): Promise<Response>{
    const { query } = req.query;

    // Check if the query parameter is provided
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
  
    try {
      // Perform search on Spotify with the provided query
      const searchResults = await searchSpotifyTracks(query as string);
      return res.json(searchResults); // Return the search results
    } catch (error) {
      // Handle any errors that may occur during the search
      return res.status(500).json({ error: 'Failed to fetch tracks from Spotify' });
    }

  }

  songQueue(): Song[] {
    const songs: Song[] = [  ];
    return songs;
  }
 
  voteToSkip(): void {}

}

// src/controllers/JukeboxController.ts

import { Request, Response } from 'express';
import { searchSpotifyTracks } from '../services/JukeboxService';
import { Song } from '../types/CoveyTownSocket';
import { none } from 'ramda';




export default class JukeboxController {
  //plays songs and check if a song is playing
  playSong(): boolean { return false;}
  //adjust the volume in the town
  adjustVolume(volume: number): void{}
  //adds a songname to a Queue ... this queue could be implemented in jukebox class constructor as a global Queue <bad i know>
  addToQueue(songName: Song): void{
    
  }
  //returns a list of songs from the Queue
  songQueue(): Song[] {
    const songs: Song[] = [  ];
    return songs;
  }
  //vote to skip song asfter a threeshold is met
  voteToSkip(): void {}
  //search for song
  /** Controller for handling Spotify search requests */
  async searchSong(req: Request, res: Response):Promise<Response> {
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

  } 
};


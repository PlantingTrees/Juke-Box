// src/controllers/JukeboxController.ts

import { Request, Response } from 'express';
import { searchSpotifyTracks } from '../services/JukeboxService';
import { Song } from '../types/CoveyTownSocket';
import { none } from 'ramda';



///interface for jukebox
export default class JukeboxController {
  localQueue: Song[];
  constructor() {
    this.localQueue = [];
  }
  isSongPlaying(): boolean { return false;}

  adjustVolume(volume: number): void{
    const town_volume = volume;
    console.log("Volume has been implemented");
  }
 
  addToQueue(song: Song): void{
    this.localQueue.push(song);
  }
  
  removeFromQueue(): void{
    this.localQueue.shift()
  }
  // async songSearch(query: String): Promise<SearchList[]>{
   
  // }
 //todo
  voteToSkip(): void {}

  

}

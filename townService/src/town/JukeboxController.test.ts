import JukeboxController from './JukeboxController';
import { Song } from '../types/CoveyTownSocket';

describe('JukeboxController', () => {
  let controller: JukeboxController;

  beforeEach(() => {
    controller = new JukeboxController();
  });

  it('should add a song to the queue', () => {
    const song: Song = {artistName: "young thug", songName: "Dreamer", albumName: "Free Gucci", artworkUrl:"Spotify.com/youngthug", songDurationSec:30, trackUri:"/youngthug"}
    controller.addToQueue(song);
    expect(controller.localQueue).toHaveLength(1);
    expect(controller.localQueue[0]).toEqual(song);
  });

  it('should remove a song from the queue', () => {
    const song: Song = {artistName: "young", songName: "Dr", albumName: "Gucci", artworkUrl:"Spotify.com/thug", songDurationSec:34, trackUri:"/thug"}
    controller.addToQueue(song);
    controller.removeFromQueue();
    expect(controller.localQueue).toHaveLength(0);
  });

  it('should return false for isSongPlaying', () => {
    expect(controller.isSongPlaying()).toBe(false);
  });

  it('should adjust volume and log a message', () => {
    console.log = jest.fn(); // Mock console.log
    controller.adjustVolume(50);
    expect(console.log).toHaveBeenCalledWith('Volume has been implemented');
  });
});

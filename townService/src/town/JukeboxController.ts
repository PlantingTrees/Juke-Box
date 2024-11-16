import { Song } from '../types/CoveyTownSocket';

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
  public adjustVolume(volume: number): void {}

  addToQueue(song: Song): void {
    this.localQueue.push(song);
  }

  public removeFromQueue(): void {
    this.localQueue.shift();
  }

  static voteToSkip(): void {}
}

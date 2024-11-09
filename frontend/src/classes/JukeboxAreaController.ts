import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';
import { JukeboxArea as JukeboxAreaModel, Song } from '../types/CoveyTownSocket';

export type JukeboxAreaEvents = {
  songsAdded: (songs: Song[]) => void;
  currentlyPlaying: (isPlaying: boolean) => void;
  playerSearch: (search: Song[]) => void;
  volumeLevelChanged: (level: number) => void;
};

export default class JukeboxAreaController extends (EventEmitter as new () => TypedEventEmitter<JukeboxAreaEvents>) {
  private _model: JukeboxAreaModel;

  constructor(jukeboxAreaModel: JukeboxAreaModel) {
    super();
    this._model = jukeboxAreaModel;
  }

  public get id() {
    return this._model.id;
  }

  public get isPlaying() {
    return this._model.isPlaying;
  }

  public set isPlaying(isPlaying: boolean) {
    if (this._model.isPlaying !== isPlaying) {
      this._model.isPlaying = isPlaying;
      this.emit('currentlyPlaying', isPlaying);
    }
  }

  public get volume() {
    return this._model.volume;
  }

  public set volume(volume: number) {
    if (this._model.volume !== volume) {
      this._model.volume = volume;
      this.emit('volumeLevelChanged', volume);
    }
  }

  public get songs() {
    return this._model.queue;
  }

  public set songs(songs: Song[]) {
    if (this._model.queue !== songs) {
      this._model.queue = songs;
      this.emit('songsAdded', songs);
    }
  }

  public get results() {
    return this._model.searchList;
  }

  //Implicity there would be no way that a result would be the same.
  //Every search would be different unless the user looks for the same thing.
  //"For every search x, there is an x that equals y."
  //The same property would be applied to the actual queue as well.
  public set results(search: Song[]) {
    if (this._model.searchList !== search) {
      this._model.searchList = search;
      this.emit('playerSearch', search);
    }
  }

  public get numOfSongs() {
    if (this._model.queue) {
      return this._model.queue.length;
    }

    return 0;
  }

  public updateFrom(newModel: JukeboxAreaModel): void {
    this.results = newModel.searchList;
    this.volume = newModel.volume;
    this.songs = newModel.queue;
    this.isPlaying = newModel.isPlaying;
  }

  public toInteractableModel(): JukeboxAreaModel {
    return this._model;
  }
}

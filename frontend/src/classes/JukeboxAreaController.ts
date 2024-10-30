import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';
import { JukeboxArea, JukeboxArea as JukeboxAreaModel, Song } from '../types/CoveyTownSocket';

export type JukeboxAreaEvents = {
  songsAdded: (songs: Song[]) => void;
  currentlyPlaying: (isPlaying: boolean) => void;
};

export default class JukeboxAreaController extends (EventEmitter as new () => TypedEventEmitter<JukeboxAreaEvents>) {
  private _model: JukeboxAreaModel;

  constructor(jukeboxAreaModel: JukeboxAreaModel) {
    super();
    this._model = jukeboxAreaModel;
  }

  get id() {
    return this._model.id;
  }

  get isPlaying() {
    return this._model.isPlaying;
  }

  public set isPlaying(isPlaying: boolean) {
    if (this._model.isPlaying != isPlaying) {
      this._model.isPlaying = isPlaying;
      this.emit('currentlyPlaying', isPlaying);
    }
  }

  get volume() {
    return this._model.volume;
  }

  get songs(): Song[] | undefined {
    return this._model.queue;
  }

  get numOfSongs() {
    if (this._model.queue) {
      return this._model.queue.length;
    }

    return 0;
  }

  addSongs(songs: Song[]) {
    if (this._model.queue !== songs) {
      this._model.queue = songs;
      this.emit('songsAdded', this._model.queue);
    }
  }

  protected _updateFrom(newModel: JukeboxArea): void {
    if (newModel.queue) {
      this.addSongs(newModel.queue);
    }

    this._model.isPlaying = newModel.isPlaying;
  }

  toInteractableModel(): JukeboxArea {
    return this._model;
  }
}

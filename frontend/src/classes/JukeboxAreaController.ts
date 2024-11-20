import EventEmitter from 'events';
import TypedEventEmitter from 'typed-emitter';
import { JukeboxArea as JukeboxAreaModel, Song } from '../types/CoveyTownSocket';

export type JukeboxAreaEvents = {
  songsAdded: (songs: Song[]) => void;
  currentlyPlaying: (isPlaying: boolean) => void;
  playerSearch: (search: Song[]) => void;
  volumeLevelChanged: (level: number) => void;
  // when user search has been changed MUST only be executed if and only if currentlyPlaying's isPlaying is false,
  // wait your damn turn
  onSongSearchChange: (newSearchQuery: string | undefined) => void;
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
    if (JSON.stringify(this._model.queue) !== JSON.stringify(songs)) {
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
    if (JSON.stringify(this._model.searchList) !== JSON.stringify(search)) {
      this._model.searchList = search;
      this.emit('playerSearch', search);
    }
  }

  public get searchQuery() {
    return this._model.searchQuery;
  }

  public set searchQuery(query: string | undefined) {
    if (this._model.isPlaying === true) {
      //wait your turn
      console.log('You MUST wait your turn to set song...');
    } else if (this._model.searchQuery !== query) {
      this._model.searchQuery = query;
      this.emit('onSongSearchChange', query);
    }
  }

  public get numOfSongs() {
    if (this._model.queue) {
      return this._model.queue.length;
    }

    return 0;
  }

  /**
   * @returns JukeBoxAreaModel that represents the current state of this ViewingAreaController
   */
  public JukeBoxAreaModel(): JukeboxAreaModel {
    return this._model;
  }

  public updateFrom(newModel: JukeboxAreaModel): void {
    // this is how coveyTown socket interface for jukeBox updates jukeBoxController...
    this.results = newModel.searchList;
    this.volume = newModel.volume;
    this.songs = newModel.queue;
    this.isPlaying = newModel.isPlaying;
    // may not be necessary, however it is nice to see the result of what you searched for...
    // this way it can be rerendered to a react component
    this.searchQuery = newModel.searchQuery;
  }

  public toInteractableModel(): JukeboxAreaModel {
    // this is how the jukeBoxController send the data from this class controller to the coveyTown socket interface for jukeBox
    return {
      id: this._model.id,
      isPlaying: this._model.isPlaying,
      queue: this._model.queue,
      searchList: this._model.searchList,
      volume: this._model.volume,
      searchQuery: this._model.searchQuery,
    };
  }
}

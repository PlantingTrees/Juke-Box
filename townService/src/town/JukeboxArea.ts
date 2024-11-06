import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  BoundingBox,
  JukeboxArea as JukeboxAreaModel,
  Song,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class JukeboxArea extends InteractableArea {
  private _isPlaying: boolean;

  private _volume: number;

  private _queue: Song[];

  public get volume() {
    return this._volume;
  }

  public get isPlaying() {
    if (this._queue.length > 0) return true;
    return false;
  }

  public get queue() {
    return this._queue;
  }

  /**
   * Creates a new JukeboxArea
   *
   * @param JukeboxArea model containing this area's starting state
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, isPlaying, queue, volume }: JukeboxAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._volume = volume;
    this._isPlaying = isPlaying;
    this._queue = queue;
  }

  /**
   * Removes a player from this viewing area.
   *
   * When the last player leaves, this method clears the video of this area and
   * emits that update to all of the players
   *
   * @param player
   */
  public remove(player: Player): void {
    super.remove(player);
    if (this._occupants.length === 0) {
      this._emitAreaChanged();
    }
  }

  /**
   * Updates the state of this JukeboxArea, setting the video, isPlaying and progress properties
   *
   * @param viewingArea updated model
   */
  public updateModel({ isPlaying, queue, volume }: JukeboxAreaModel) {
    this._volume = volume;
    this._isPlaying = isPlaying;
    this._queue = queue;
  }

  /**
   * Convert this JukeboxArea instance to a simple JukeboxAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): JukeboxAreaModel {
    return {
      id: this.id,
      volume: this._volume,
      isPlaying: this._isPlaying,
      queue: this._queue,
    };
  }

  /**
   * Creates a new JukeboxArea object that will represent a Jukebox Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this viewing area exists
   * @param townEmitter An emitter that can be used by this viewing area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): JukeboxArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new JukeboxArea({ isPlaying: false, id: name, volume: 0, queue: [] }, rect, townEmitter);
  }
}

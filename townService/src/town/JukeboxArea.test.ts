import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { Song, TownEmitter } from '../types/CoveyTownSocket';
import JukeboxArea from './JukeboxArea';

describe('JukeboxArea', () => {
  const testAreaBox = { x: 50, y: 50, width: 100, height: 100 };
  let testArea: JukeboxArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let newPlayer: Player;

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new JukeboxArea(
      { id, isPlaying: false, queue: [], volume: 50, searchList: [] },
      testAreaBox,
      townEmitter,
    );
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });

  describe('add', () => {
    it('Adds the player to the occupants list and emits an interactableUpdate event', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        isPlaying: false,
        queue: [],
        volume: 50,
        searchList: [],
      });
    });
  });

  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        isPlaying: false,
        queue: [],
        volume: 50,
        searchList: [],
      });
    });

    it('Clears the player’s interactableID when they leave the JukeboxArea', () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });

    it('Emits an update when the last player leaves', () => {
      testArea.remove(newPlayer);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        isPlaying: false,
        queue: [],
        volume: 50,
        searchList: [],
      });
    });
  });

  describe('updateModel', () => {
    it('Updates the JukeboxArea model and emits an interactableUpdate event', () => {
      const newQueue: Song[] = [
        {
          songName: 'Track 1',
          songDurationSec: 180000,
          albumName: 'Album 1',
          artistName: 'Artist 1',
          artworkUrl: '',
          trackUri: 'uri1',
        },
      ];
      testArea.updateModel({ id, isPlaying: true, queue: newQueue, volume: 75, searchList: [] });

      expect(testArea.queue).toEqual(newQueue);
      expect(testArea.volume).toEqual(75);
      expect(testArea.isPlaying).toBeTruthy();
    });
  });

  describe('toModel', () => {
    it('Converts the JukeboxArea to a model with current state', () => {
      const model = testArea.toModel();
      expect(model).toEqual({
        id,
        isPlaying: false,
        queue: [],
        volume: 50,
        searchList: [],
      });
    });
  });

  describe('fromMapObject', () => {
    it('Throws an error if the width or height are missing', () => {
      expect(() =>
        JukeboxArea.fromMapObject({ id: 1, name: id, visible: true, x: 0, y: 0 }, townEmitter),
      ).toThrowError();
    });

    it('Creates a JukeboxArea with the correct bounding box, ID, and initial values', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'testJukebox';
      const jukebox = JukeboxArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );

      expect(jukebox.boundingBox).toEqual({ x, y, width, height });
      expect(jukebox.id).toEqual(name);
      expect(jukebox.queue).toEqual([]);
      expect(jukebox.volume).toBe(0);
      expect(jukebox.isPlaying).toBeFalsy();
    });
  });
});

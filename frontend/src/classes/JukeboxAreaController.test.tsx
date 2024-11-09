import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { JukeboxArea, Song } from '../types/CoveyTownSocket';
import JukeboxAreaController, { JukeboxAreaEvents } from './JukeboxAreaController';
import TownController from './TownController';

describe('[T2] JukeboxAreaController Test', () => {
  //Jukebox Area to be used in all tests. Basically uses a mock jukebox.
  let testArea: JukeboxAreaController;
  let testModel: JukeboxArea;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<JukeboxAreaEvents>();
  beforeEach(() => {
    testModel = {
      id: nanoid(),
      isPlaying: false,
      volume: 50,
      queue: [],
      searchList: [],
    };
    testArea = new JukeboxAreaController(testModel);
    mockClear(townController);
    mockClear(mockListeners.currentlyPlaying);
    mockClear(mockListeners.playerSearch);
    mockClear(mockListeners.songsAdded);
    mockClear(mockListeners.volumeLevelChanged);
    testArea.addListener('currentlyPlaying', mockListeners.currentlyPlaying);
    testArea.addListener('songsAdded', mockListeners.songsAdded);
    testArea.addListener('playerSearch', mockListeners.playerSearch);
    testArea.addListener('volumeLevelChanged', mockListeners.volumeLevelChanged);
  });
  describe('Setting up Song Queue Property', () => {
    it('updates the song proprty and emits a songAdded event if a song is added', () => {
      const newSong: Song = {
        artistName: 'Ludwig Göransson',
        trackUri: 'spotify:track:4VnDmjYCZkyeqeb0NIKqdA',
        songName: 'Can You Hear The Music',
        songDurationSec: 110160,
        albumName: 'Oppenheimer (Original Motion Picture Soundtrack)',
        artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273af634982d9b15de3c77f7dd9',
      };
      const listOfSongs = [newSong];
      testArea.songs = listOfSongs;
      expect(mockListeners.songsAdded).toBeCalledWith(listOfSongs);
      expect(testArea.songs).toBe(listOfSongs);
    });
    it('does not emit a songsAdded event if the song queue does not change', () => {
      const currentQueue = testArea.songs;
      testArea.songs = [...currentQueue];
      expect(mockListeners.songsAdded).not.toBeCalled();
    });
  });
  describe('Setting up the Search List Property', () => {
    it('updates the search list property and emits a songAdded event is a search is made', () => {
      const firstSong: Song = {
        artistName: 'Ludwig Göransson',
        trackUri: 'spotify:track:4VnDmjYCZkyeqeb0NIKqdA',
        songName: 'Can You Hear The Music',
        songDurationSec: 110160,
        albumName: 'Oppenheimer (Original Motion Picture Soundtrack)',
        artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273af634982d9b15de3c77f7dd9',
      };

      const secondSong: Song = {
        songName: 'Can You Feel the Love Tonight - From "The Lion King" / Soundtrack Version',
        songDurationSec: 177360,
        albumName: 'Disney Summer Songs',
        artistName: 'Joseph Williams',
        artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737b1489e71cadf8a1c0382d7d',
        trackUri: 'spotify:track:2XQee7HP5QrDwUGHOl6GFf',
      };

      const newSearch: Song[] = [firstSong, secondSong];
      testArea.results = newSearch;
      expect(mockListeners.playerSearch).toBeCalledWith(newSearch);
      expect(testArea.results).toBe(newSearch);
    });
    it('does not emit a songsAdded event if the song queue does not change', () => {
      const searchResults = testArea.results;
      testArea.songs = [...searchResults];
      expect(mockListeners.playerSearch).not.toBeCalled();
    });
  });
  describe('Setting up the volume property', () => {
    it('updates the volume with the value set and emits a volume level changed emitter', () => {
      testArea.volume = 65;
      expect(mockListeners.volumeLevelChanged).toBeCalledWith(65);
      expect(testArea.volume).toBe(65);
    });
    it('should not emit anything if it does not change', () => {
      testArea.volume = 50;
      expect(mockListeners.volumeLevelChanged).not.toBeCalled();
    });
  });
  describe('Setting up the property if the jukebox is currently playing', () => {
    it('updates the isPlaying property and emits an event if so', () => {
      testArea.isPlaying = true;
      expect(mockListeners.currentlyPlaying).toBeCalledWith(true);
      expect(testArea.isPlaying).toBe(true);
    });
    it('should not emit an event if the value has not changed', () => {
      testArea.isPlaying = false;
      expect(mockListeners.currentlyPlaying).not.toBeCalled();
    });
  });
  describe('Getting the number of songs from the queue', () => {
    it('should get the total number of songs from the queue', () => {
      const firstSong: Song = {
        artistName: 'Ludwig Göransson',
        trackUri: 'spotify:track:4VnDmjYCZkyeqeb0NIKqdA',
        songName: 'Can You Hear The Music',
        songDurationSec: 110160,
        albumName: 'Oppenheimer (Original Motion Picture Soundtrack)',
        artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273af634982d9b15de3c77f7dd9',
      };

      const secondSong: Song = {
        songName: 'Can You Feel the Love Tonight - From "The Lion King" / Soundtrack Version',
        songDurationSec: 177360,
        albumName: 'Disney Summer Songs',
        artistName: 'Joseph Williams',
        artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2737b1489e71cadf8a1c0382d7d',
        trackUri: 'spotify:track:2XQee7HP5QrDwUGHOl6GFf',
      };

      const thirdSong: Song = {
        songName: 'Waking Up',
        songDurationSec: 316786,
        albumName: 'Holy Water',
        artistName: 'We The Kingdom',
        artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273af634982d9b15de3c77f7dd9',
        trackUri: 'spotify:track:4VnDmjYCZkyeqeb0NIKqdA',
      };

      const newQueue: Song[] = [firstSong, secondSong, thirdSong];

      testArea.songs = newQueue;
      expect(testArea.numOfSongs).toEqual(3);
    });
  });
  describe('Retrives JukeboxAreaModel', () => {
    it('should get the JukeboxAreaModel', () => {
      const testJukeboxModel = testArea.toInteractableModel();
      expect(testJukeboxModel).toEqual(testModel);
    });
  });
  describe('testing the updateFrom function', () => {
    it('updates all properties and emits their events', () => {
      const songAlreadyInQueue: Song = {
        artistName: 'Ludwig Göransson',
        trackUri: 'spotify:track:4VnDmjYCZkyeqeb0NIKqdA',
        songName: 'Can You Hear The Music',
        songDurationSec: 110160,
        albumName: 'Oppenheimer (Original Motion Picture Soundtrack)',
        artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273af634982d9b15de3c77f7dd9',
      };

      const firstResult: Song = {
        songName: 'Waking Up',
        songDurationSec: 316786,
        albumName: 'Holy Water',
        artistName: 'We The Kingdom',
        artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273af634982d9b15de3c77f7dd9',
        trackUri: 'spotify:track:4VnDmjYCZkyeqeb0NIKqdA',
      };

      const secondResult: Song = {
        songName: 'I Got the Music (feat. Madison Reyes & Jadah Marie)',
        songDurationSec: 227861,
        albumName: 'Julie and the Phantoms: Season 1 (From the Netflix Original Series)',
        artistName: 'Julie and the Phantoms Cast',
        artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273b51d34b240a45a9223f7291b',
        trackUri: 'spotify:track:6w1NrWbzyMG9LPdtmQyTAN',
      };

      const newModel: JukeboxArea = {
        id: testArea.id,
        isPlaying: true,
        volume: 65,
        searchList: [firstResult, secondResult],
        queue: [songAlreadyInQueue],
      };

      testArea.updateFrom(newModel);
      expect(testArea.isPlaying).toEqual(newModel.isPlaying);
      expect(testArea.volume).toEqual(newModel.volume);
      expect(testArea.songs).toEqual(newModel.queue);
      expect(testArea.results).toEqual(newModel.searchList);
      expect(mockListeners.currentlyPlaying).toBeCalledWith(newModel.isPlaying);
      expect(mockListeners.playerSearch).toBeCalledWith(newModel.searchList);
      expect(mockListeners.songsAdded).toBeCalledWith(newModel.queue);
      expect(mockListeners.volumeLevelChanged).toBeCalledWith(newModel.volume);
    });
    it('does not change the id of the controller', () => {
      const currentID = testArea.id;
      const newModel: JukeboxArea = {
        id: testArea.id,
        isPlaying: !true,
        volume: 65 + 1,
        searchList: [],
        queue: [],
      };
      testArea.updateFrom(newModel);
      expect(testArea.id).toEqual(currentID);
    });
  });
});

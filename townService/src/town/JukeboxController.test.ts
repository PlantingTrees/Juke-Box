// src/services/__tests__/spotifyService.test.ts
import axios from 'axios';
import { searchSpotifyTracks } from '../services/JukeboxService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Spotify Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSpotifyAccessToken', () => {
    it('fetches and sets the access token', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'test_access_token' },
      });

      const { getSpotifyAccessToken } = await import('../services/JukeboxService');
      await getSpotifyAccessToken();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({ grant_type: 'client_credentials' }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
            ).toString('base64')}`,
          },
        },
      );
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('handles errors when fetching the access token', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Token fetch failed'));

      const { getSpotifyAccessToken } = await import('../services/JukeboxService');
      await expect(getSpotifyAccessToken()).resolves.not.toThrow();

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchSpotifyTracks', () => {
    it('makes a search request and returns track data', async () => {
      // Mock access token function
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'test_access_token' },
      });

      // Mock track data response
      mockedAxios.get.mockResolvedValueOnce({
        data: { tracks: [{ name: 'Broken Whiskey Glass' }] },
      });

      const result = await searchSpotifyTracks('Broken Whiskey Glass');

      expect(mockedAxios.get).toHaveBeenCalledWith('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer test_access_token` },
        params: { q: 'Broken Whiskey Glass', type: 'track', limit: 10 },
      });
      expect(result).toEqual({ tracks: [{ name: 'Broken Whiskey Glass' }] });
    });
  });
});

// src/services/JukeboxService.test.ts
import axios from 'axios';
// import { searchSpotifyTracks } from './JukeboxService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Jukebox Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSpotifyAccessToken', () => {
    it('fetches and sets the access token', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { access_token: 'test_access_token' },
      });

      const { getSpotifyAccessToken } = await import('./JukeboxService');
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

      const { getSpotifyAccessToken } = await import('./JukeboxService');
      await expect(getSpotifyAccessToken()).resolves.not.toThrow();

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchSpotifyTracks', () => {
    // TODO: Implement test for searching tracks
  });
});

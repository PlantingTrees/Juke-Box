// src/services/JukeboxService.ts

import axios from 'axios';
import { Song, SpotifyTrack } from '../types/CoveyTownSocket';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
let accessToken = '';
/** Fetches a new access token from Spotify */
export async function getSpotifyAccessToken(): Promise<void> {
  try {
    const response = await axios.post(
      SPOTIFY_AUTH_URL,
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
            'base64',
          )}`,
        },
      },
    );
    accessToken = response.data.access_token;
  } catch (error) {
    throw new Error('Token fetch failed');
  }
}
/** Searches Spotify for tracks by a given query */
export async function searchSpotifyTracks(query: string): Promise<Song[]> {
  if (!accessToken) {
    await getSpotifyAccessToken();
  }
  try {
    const response = await axios.get(`${SPOTIFY_BASE_URL}/search`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: 'track',
        limit: 5,
      },
    });
    // Map the Spotify response to an array of Song objects
    return response.data.tracks.items.map((track: SpotifyTrack) => ({
      trackName: track.name,
      trackDuration: track.duration_ms,
      albumName: track.album.name,
      artistName: track.artists[0].name,
      artworkUrl: track.album.images[0]?.url || '',
      trackUri: track.uri,
    }));
  } catch (error) {
    throw new Error('Failed to fetch tracks from Spotify');
  }
}

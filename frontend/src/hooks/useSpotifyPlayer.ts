// src/hooks/useSpotifyPlayer.ts

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Song } from '../types/CoveyTownSocket';

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => {
        connect: () => void;
        addListener: (event: string, callback: (data: any) => void) => void;
      };
    };
  }
}

const useSpotifyPlayer = (token: string, queue: Song[], onSongEnd: () => void) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const playTrack = (device_id: string) => {
      if (!queue[0]) {
        console.error('No track URI provided in the queue.');
        return;
      }

      axios
        .put(
          `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
          { uris: [queue[0].trackUri] }, // Play the first song in the queue
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then(response => {
          if (response.status === 204) {
            console.log(`Playback started for: ${queue[0].trackUri}`);
          } else {
            console.error('Error starting playback:', response.status, response.statusText);
          }
        })
        .catch(error => {
          console.error('Playback error:', error);
        });
    };

    if (!token || queue.length === 0) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Covey.town Jukebox Player',
        getOAuthToken: cb => cb(token),
        volume: 0.5,
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Player ready with Device ID', device_id);
        setDeviceId(device_id);
        playTrack(device_id); // Start playback immediately
      });

      player.addListener('player_state_changed', state => {
        if (!state) return;
        if (
          state.paused &&
          state.position === 0 &&
          state.track_window.current_track.uri === queue[0]?.trackUri
        ) {
          onSongEnd(); // Trigger when the song ends
        }
      });

      player.connect();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [token, queue, onSongEnd]);

  return { deviceId };
};

export default useSpotifyPlayer;

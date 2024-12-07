import { useEffect, useState, useRef } from 'react';
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
  const playerRef = useRef<any>(null); // Ref to store player instance

  useEffect(() => {
    if (!token || queue.length === 0) return;

    const playTrack = (device_id: string) => {
      if (!queue[0]) {
        console.error('No track URI provided in the queue.');
        return;
      }

      axios
        .put(
          `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
          { uris: [queue[0].trackUri] },
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

    if (playerRef.current) return; // Prevent initializing player again if it's already initialized

    // Dynamically load the Spotify SDK script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    // Log when the SDK script has loaded
    script.onload = () => {
      console.log('Spotify Player SDK script loaded');
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: 'Covey.town Jukebox Player',
          getOAuthToken: cb => cb(token),
          volume: 0.5,
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error('Initialization error:', message);
        });

        player.addListener('authentication_error', ({ message }) => {
          console.error('Authentication error:', message);
        });

        player.addListener('ready', ({ device_id }) => {
          console.log('Player ready with Device ID', device_id);
          setDeviceId(device_id);
          playTrack(device_id); // Start playback when player is ready
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
        playerRef.current = player; // Store player instance in ref
      };
    };

    script.onerror = error => {
      console.error('Error loading Spotify Player SDK:', error);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (playerRef.current) {
        playerRef.current.disconnect(); // Disconnect player when component unmounts
      }
    };
  }, [token, queue, onSongEnd]); // Depend on token and queue, not on every re-render

  return { deviceId };
};

export default useSpotifyPlayer;

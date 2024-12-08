import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

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
        disconnect: () => void;
        addListener: (event: string, callback: (data: any) => void) => void;
      };
    };
  }
}

const useSpotifyPlayer = (token: string, trackUri: string | null, onSongEnd: () => void) => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!token || !trackUri) return;

    const playTrack = (device_id: string) => {
      axios
        .put(
          `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
          { uris: [trackUri] },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then(response => {
          if (response.status === 204) {
            console.log(`Playback started for: ${trackUri}`);
          } else {
            console.error('Error starting playback:', response.status, response.statusText);
          }
        })
        .catch(error => {
          console.error('Playback error:', error);
        });
    };

    if (playerRef.current) {
      // Reuse the existing player instance to play the new track
      if (deviceId) {
        playTrack(deviceId);
      }
      return;
    }

    // Dynamically load the Spotify SDK script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

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
          playTrack(device_id);
        });

        player.addListener('player_state_changed', state => {
          if (!state) return;
          const trackEnded =
            state.paused &&
            state.position === 0 &&
            state.track_window.current_track.uri === trackUri;
          if (trackEnded) {
            onSongEnd();
          }
        });

        player.connect();
        playerRef.current = player;
      };
    };

    script.onerror = error => {
      console.error('Error loading Spotify Player SDK:', error);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token, trackUri, onSongEnd]);

  return { deviceId };
};

export default useSpotifyPlayer;

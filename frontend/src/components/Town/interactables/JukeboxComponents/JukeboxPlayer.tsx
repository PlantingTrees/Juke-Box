import React, { useState, useEffect } from "react";
import { 
  HStack, 
  Slider, 
  SliderTrack, 
  SliderFilledTrack, 
  SliderThumb, 
  IconButton 
} from '@chakra-ui/react';
import { Volume2, VolumeX } from 'lucide-react';

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
        setVolume: (volume: number) => Promise<void>;
      };
    };
  }
}

type songProp = {
  songURI: string
}

export default function JukeboxPlayer({ songURI }: songProp): JSX.Element {
  const [volume, setVolume] = useState(50);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const [prevVolume, setPrevVolume] = useState(50);

  let token = localStorage.getItem('spotify-access-token');

  useEffect(() => {
    // Load Spotify SDK script if not already loaded
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Spotify SDK initialization
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('Spotify SDK is ready');
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Covey.town Jukebox Player',
        getOAuthToken: cb => cb(token!),
        volume: volume / 100,
      });

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Player is ready with Device ID:', device_id);
        setDeviceId(device_id);
        setPlayer(spotifyPlayer);
      });

      setupPlayerListeners(spotifyPlayer);
      spotifyPlayer.connect();
    };

    // Cleanup function
    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, []);

  // Update volume when slider changes
  useEffect(() => {
    if (player) {
      try {
        // Convert volume to a decimal between 0 and 1
        player.setVolume(volume / 100).catch((error: any) => {
          console.error('Error setting volume:', error);
        });
      } catch (error) {
        console.error('Volume setting failed:', error);
      }
    }
  }, [volume, player]);

  // Play song when songURI changes
  useEffect(() => {
    if (songURI && deviceId && token) {
      playSong(songURI);
    }
  }, [songURI, deviceId, token]);

  const setupPlayerListeners = (spotifyPlayer: any) => {
    spotifyPlayer.addListener('not_ready', ({ device_id }) => {
      console.error('Player is not ready:', device_id);
    });

    spotifyPlayer.addListener('initialization_error', ({ message }) => {
      console.error('Initialization error:', message);
    });

    spotifyPlayer.addListener('authentication_error', ({ message }) => {
      console.error('Authentication error:', message);
    });

    spotifyPlayer.addListener('account_error', ({ message }) => {
      console.error('Account error:', message);
    });
  };

  const playSong = async (songUri: string) => {
    if (!deviceId || !token) {
      console.error('Device not ready or no token');
      return;
    }

    try {
      // First, transfer playback to our device
      await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false
        })
      });

      // Then play the specific track
      await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [songUri], // Spotify URI for the track
          device_id: deviceId
        })
      });

      console.log('Started playing song:', songUri);
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  const handleMuteToggle = () => {
    if (volume === 0) {
      // Unmute - restore previous volume
      setVolume(prevVolume);
    } else {
      // Mute - save current volume and set to 0
      setPrevVolume(volume);
      setVolume(0);
    }
  };

  return (
    <HStack spacing={4} p={4} bg='gray.800' borderRadius='lg' alignItems='center'>
      <IconButton
        icon={volume === 0 ? <VolumeX /> : <Volume2 />}
        aria-label='Toggle mute'
        onClick={handleMuteToggle}
        size='lg'
        bg='gray.700'
        _hover={{ bg: 'gray.600' }}
      />
      <Slider
        value={volume}
        onChange={setVolume}
        min={0}
        max={100}
        flex={1}
        aria-label='Volume Slider'
      >
        <SliderTrack bg='gray.600'>
          <SliderFilledTrack bg='teal.400' />
        </SliderTrack>
        <SliderThumb boxSize={4} />
      </Slider>
    </HStack>
  );
}
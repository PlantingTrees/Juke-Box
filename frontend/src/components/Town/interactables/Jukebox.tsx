import React, { useState, useEffect, useCallback, useRef } from 'react';
import JukeboxAreaInteractable from './JukeboxArea';
import { Volume2, VolumeX } from 'lucide-react';
import { useInteractable, useJukeboxAreaController } from '../../../classes/TownController';
import {
  Modal,
  ModalOverlay,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalContent,
  IconButton,
  VStack,
  Box,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import useTownController from '../../../hooks/useTownController';
import JukeboxSearch from './JukeboxComponents/JukeboxSearch';
import { Song } from '../../../../../shared/types/CoveyTownSocket';
import JukeboxQueue from './JukeboxComponents/JukeboxQueue';
import JukeboxSong from './JukeboxComponents/JukeboxSong';

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

export function JukeboxArea({
  jukeboxArea,
}: {
  jukeboxArea: JukeboxAreaInteractable;
}): JSX.Element {
  const coveyTownController = useTownController();
  const jukeboxAreaController = useJukeboxAreaController(jukeboxArea.name);

  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [queueItems, setQueueItems] = useState<Song[]>(jukeboxAreaController.songs);
  const [token, setToken] = useState<string | null>(null); // Spotify token state
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if the user is logged in
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null); // State for currently playing track

  const playerRef = useRef<any>(null);

  const closeModal = useCallback(() => {
    if (jukeboxArea) {
      coveyTownController.interactEnd(jukeboxArea);
    }
    setIsOpen(false);
  }, [coveyTownController, jukeboxArea]);

  useEffect(() => {
    if (jukeboxArea) {
      setIsOpen(true);
    }
  }, [jukeboxArea]);

  const addSongToQueue = (song: Song) => {
    setQueueItems(prevQueue => {
      const newQueue = [...prevQueue, song];
      jukeboxAreaController.songs = newQueue;
      return newQueue;
    });
  };

  useEffect(() => {
    const queueListener = (newQueue: Song[]) => {
      setQueueItems(newQueue);
    };

    jukeboxAreaController.addListener('songsAdded', queueListener);
    coveyTownController.emitJukeboxAreaUpdate(jukeboxAreaController);
    return () => {
      jukeboxAreaController.removeListener('songsAdded', queueListener);
    };
  }, [jukeboxAreaController, coveyTownController]);

  // Function to handle Spotify login
  const loginToSpotify = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI as string;
    const scopes =
      'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative';
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}`;

    window.location.href = authUrl; // Redirect user to login page
  };

  // Function to handle Spotify token from URL hash
  const handleSpotifyToken = useCallback(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.slice(1)); // Remove the '#' symbol
      const accessToken = params.get('access_token');
      if (accessToken) {
        setToken(accessToken);
        setIsLoggedIn(true); // Mark as logged in
        window.location.hash = ''; // Clean up the URL hash after processing
      }
    }
  }, []);

  // Check for token in URL when the component mounts
  useEffect(() => {
    handleSpotifyToken();
  }, [handleSpotifyToken]);

  const handleSongEnd = () => {
    setQueueItems(prevQueue => {
      console.log('Before update:', prevQueue);
      if (prevQueue.length <= 1) {
        jukeboxAreaController.songs = []; // Clear songs when queue is empty or only one remains
        coveyTownController.emitJukeboxAreaUpdate(jukeboxAreaController);
        return [];
      }

      const newQueue = prevQueue.slice(1); // Remove the first song
      jukeboxAreaController.songs = newQueue; // Update controller
      console.log('After update:', newQueue);

      coveyTownController.emitJukeboxAreaUpdate(jukeboxAreaController); // Emit the change
      return newQueue; // Update state
    });
  };

  // Load and initialize the Spotify Player when the modal opens
  useEffect(() => {
    if (!token) return;

    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;

      script.onload = () => {
        console.log('Spotify SDK script loaded.');
      };

      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('Spotify SDK is ready');
      const player = new window.Spotify.Player({
        name: 'Covey.town Jukebox Player',
        getOAuthToken: cb => cb(token),
        volume: volume / 100,
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Player is ready with Device ID:', device_id);
        setDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.error('Player is not ready:', device_id);
      });

      player.addListener('initialization_error', ({ message }) => {
        console.error('Initialization error:', message);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error('Authentication error:', message);
      });

      player.addListener('account_error', ({ message }) => {
        console.error('Account error:', message);
      });

      let debounceTimeout: NodeJS.Timeout | null = null;

      player.addListener('player_state_changed', state => {
        console.log('Player state changed:', state);
        if (!state) return;

        if (state.paused && state.position === 0 && state.track_window.previous_tracks.length > 0) {
          if (debounceTimeout) clearTimeout(debounceTimeout);

          debounceTimeout = setTimeout(() => {
            handleSongEnd();
          }, 100); // Wait 100ms to ensure no duplicate calls (this is essential. DO NOT DELETE.)
        }
      });

      player.connect();
      playerRef.current = player;
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token]);

  // Update player volume when the slider changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume / 100).catch((error: unknown) => {
        console.error('Error setting volume:', error);
      });
    }
  }, [volume]);

  // Play songs when the queue changes
  useEffect(() => {
    if (!deviceId || !queueItems.length || !token) return;

    const trackUri = queueItems[0].trackUri;

    // Only play if the current track is different
    if (trackUri !== currentTrack) {
      setCurrentTrack(trackUri); // Update current track

      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [trackUri] }),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(error => console.error('Error playing track:', error));
    }
  }, [queueItems, deviceId, token, currentTrack]);

  return (
    <>
      {jukeboxArea && (
        <Modal
          isOpen={isOpen}
          onClose={() => {
            closeModal();
            coveyTownController.unPause();
          }}
          size='4xl'>
          <ModalOverlay />
          <ModalContent
            bg='linear-gradient(135deg, #1f1f1f, #282828)'
            color='white'
            borderRadius='lg'
            p={6}
            maxWidth='1200px'
            boxShadow='xl'>
            <ModalHeader fontSize='2xl' fontWeight='bold' borderBottom='1px solid gray'>
              Covey.Town Jukebox
            </ModalHeader>
            <ModalCloseButton color='white' />
            <ModalBody>
              <Grid templateColumns='repeat(2, 1fr)' gap={6}>
                {/* Left Panel: Search and Volume */}
                <GridItem>
                  <VStack spacing={6} align='stretch'>
                    <Box bg='gray.800' p={4} borderRadius='lg' color={'black'}>
                      <JukeboxSearch setQueueItems={addSongToQueue} />
                    </Box>
                    <HStack spacing={4} p={4} bg='gray.800' borderRadius='lg' alignItems='center'>
                      <IconButton
                        icon={volume === 0 ? <VolumeX /> : <Volume2 />}
                        aria-label='Toggle mute'
                        onClick={() => setVolume(volume === 0 ? 50 : 0)}
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
                        aria-label='Volume Slider'>
                        <SliderTrack bg='gray.600'>
                          <SliderFilledTrack bg='teal.400' />
                        </SliderTrack>
                        <SliderThumb boxSize={4} />
                      </Slider>
                    </HStack>
                  </VStack>
                </GridItem>

                {/* Right Panel: Current Song or Queue */}
                <GridItem>
                  <VStack spacing={6} align='stretch'>
                    {isQueueVisible ? (
                      <JukeboxQueue currentQueue={queueItems} />
                    ) : (
                      <JukeboxSong currentQueue={queueItems} />
                    )}
                    <Button
                      onClick={() => setIsQueueVisible(!isQueueVisible)}
                      variant='solid'
                      colorScheme='teal'
                      size='lg'
                      width='100%'>
                      {isQueueVisible ? 'Show Song' : 'Show Queue'}
                    </Button>
                  </VStack>
                </GridItem>
              </Grid>
            </ModalBody>
            <ModalFooter
              borderTop='1px solid gray'
              display='flex'
              flexDirection='column'
              alignItems='center'>
              {!isLoggedIn && (
                <>
                  <Button
                    onClick={loginToSpotify}
                    variant='solid'
                    colorScheme='teal'
                    size='md'
                    width='100%'
                    mb={2}>
                    Log in to Spotify
                  </Button>
                  <Box color='gray.400' fontSize='sm' textAlign='center'>
                    Log in to Spotify to listen to the Covey.Town Jukebox!
                  </Box>
                </>
              )}
            </ModalFooter>
            <ModalFooter borderTop='1px solid gray' />
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export default function JukeboxAreaWrapper(): JSX.Element {
  const jukeboxArea = useInteractable<JukeboxAreaInteractable>('jukeboxArea');
  if (jukeboxArea) {
    return <JukeboxArea jukeboxArea={jukeboxArea} />;
  }
  return <></>;
}

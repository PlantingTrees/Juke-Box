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
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI as string; // Adjust based on your setup
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
      if (prevQueue.length === 0) {
        return []; // No songs to play
      }

      const newQueue = prevQueue.slice(1); // Remove the first song from the queue

      // Update the controller and emit the new state
      jukeboxAreaController.songs = newQueue;
      coveyTownController.emitJukeboxAreaUpdate(jukeboxAreaController);

      return newQueue; // Ensure the React state matches the controller state
    });
  };

  // Load and initialize Spotify Player
  useEffect(() => {
    if (!token || queueItems.length === 0) return;

    const trackUri = queueItems[0].trackUri;

    const playTrack = (device_id: string) => {
      fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [trackUri] }),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }).catch(error => console.error('Error playing track:', error));
    };

    if (playerRef.current) {
      // Use existing player
      if (deviceId) {
        playTrack(deviceId);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    script.onload = () => {
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: 'Covey.town Jukebox Player',
          getOAuthToken: cb => cb(token),
          volume: volume / 100,
        });

        player.addListener('ready', ({ device_id }) => {
          console.log('Spotify Player is ready with Device ID:', device_id);
          setDeviceId(device_id);
          playTrack(device_id);
        });

        player.addListener('player_state_changed', state => {
          if (state && state.paused && state.position === 0) {
            handleSongEnd();
          }
        });

        player.connect();
        playerRef.current = player;
      };
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (playerRef.current) {
        playerRef.current.disconnect();
      }
    };
  }, [token, queueItems, volume]);

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

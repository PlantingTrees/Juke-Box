import React, { useState, useEffect, useCallback } from 'react';
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
import JukeboxPlayer from './JukeboxComponents/JukeboxPlayer'; // Import the player

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
  const [currentSongProgress, setCurrentSongProgress] = useState(0);
  const [token, setToken] = useState<string | null>(null); // Spotify token state
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if the user is logged in
  const backendURL = process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL;

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

  // Function to handle Spotify login
  const loginToSpotify = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI as string; // Adjust based on your setup
    const scopes =
      'user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative';
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

  // Add a song to the queue
  const addSongToQueue = (song: Song) => {
    setQueueItems(prevQueue => {
      const newQueue = [...prevQueue, song];
      jukeboxAreaController.songs = newQueue;
      coveyTownController.emitJukeboxAreaUpdate(jukeboxAreaController);
      return newQueue;
    });
  };

  // Handle song end: remove the first song in the queue
  const handleSongEnd = () => {
    setQueueItems(prevQueue => {
      const newQueue = prevQueue.slice(1); // Remove the first song
      jukeboxAreaController.songs = newQueue;
      coveyTownController.emitJukeboxAreaUpdate(jukeboxAreaController);
      return newQueue;
    });
  };

  // Monitor queue for updates
  useEffect(() => {
    const queueListener = (newQueue: Song[]) => {
      setQueueItems(newQueue);
    };

    jukeboxAreaController.addListener('songsAdded', queueListener);
    return () => {
      jukeboxAreaController.removeListener('songsAdded', queueListener);
    };
  }, [jukeboxAreaController]);

  return (
    <>
      {jukeboxArea && (
        <>
          {/* Show login button if not logged in */}
          {!isLoggedIn ? (
            <Button onClick={loginToSpotify} colorScheme='green' size='lg' width='100%'>
              Log in to Spotify
            </Button>
          ) : (
            <>
              {/* Spotify Player Integration */}
              <JukeboxPlayer token={token} queue={queueItems} onSongEnd={handleSongEnd} />

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
                          <HStack
                            spacing={4}
                            p={4}
                            bg='gray.800'
                            borderRadius='lg'
                            alignItems='center'>
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
                  <ModalFooter borderTop='1px solid gray' />
                </ModalContent>
              </Modal>
            </>
          )}
        </>
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

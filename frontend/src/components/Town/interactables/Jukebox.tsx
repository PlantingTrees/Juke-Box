import React, { useState, useEffect, useCallback } from 'react';
import JukeboxAreaInteractable from './JukeboxArea';
import { Music, Volume2, VolumeX } from 'lucide-react';
import { useInteractable } from '../../../classes/TownController';
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
  Image,
  Text,
  Grid,
  GridItem,
  Spinner,
  Progress,
} from '@chakra-ui/react';
import useTownController from '../../../hooks/useTownController';
import JukeboxSearch from './JukeboxComponents/JukeboxSearch';
import { Song } from '../../../../../shared/types/CoveyTownSocket';

export default function JukeboxArea(): JSX.Element {
  const jukeboxArea = useInteractable<JukeboxAreaInteractable>('jukeboxArea');
  const coveyTownController = useTownController();

  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [queueItems, setQueueItems] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSongProgress, setCurrentSongProgress] = useState(0);

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
    setQueueItems(prevQueue => [...prevQueue, song]);
  };

  const waitTime = (index: number) => {
    if (index === 0) {
      return 'Now Playing';
    }
    let time = 0;
    for (let i = index - 1; i >= 0; i--) {
      time = time + Math.trunc(queueItems[i].songDurationSec / (1000 * 60));
    }
    return 'Wait Time: ' + time + ' min';
  };

  useEffect(() => {
    if (queueItems.length > 0) {
      const interval = setInterval(() => {
        setCurrentSongProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [queueItems]);

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
                      {isLoading ? (
                        <Spinner size='lg' color='teal' />
                      ) : (
                        <JukeboxSearch setQueueItems={addSongToQueue} />
                      )}
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
                      <Box bg='gray.800' borderRadius='lg' p={4} maxHeight='350px' overflowY='auto'>
                        {queueItems.length > 0 ? (
                          queueItems.map((song, index) => (
                            <HStack
                              key={index}
                              spacing={4}
                              p={3}
                              borderRadius='md'
                              bg='gray.700'
                              _hover={{ bg: 'gray.600' }}
                              alignItems='center'>
                              <Box
                                w='10px'
                                h='10px'
                                borderRadius='full'
                                bg={index === 0 ? 'green.400' : 'blue.400'}
                              />
                              <Text fontSize='lg' fontWeight='bold' flex={1}>
                                {song.songName} - {song.artistName}
                              </Text>
                              <Text fontSize='sm' color='gray.400'>
                                {waitTime(index)}
                              </Text>
                            </HStack>
                          ))
                        ) : (
                          <Text>No songs in the queue yet!</Text>
                        )}
                      </Box>
                    ) : (
                      <Box
                        bg='gray.800'
                        borderRadius='lg'
                        p={6}
                        textAlign='center'
                        height='350px'
                        display='flex'
                        flexDirection='column'
                        justifyContent='center'
                        alignItems='center'>
                        {queueItems.length > 0 ? (
                          <>
                            <Text fontSize='lg' fontWeight='bold' mb={2}>
                              Currently Playing:
                            </Text>
                            <Image
                              src={queueItems[0]?.artworkUrl || '/placeholder.png'}
                              alt='Song artwork'
                              boxSize='200px'
                              objectFit='cover'
                              borderRadius='md'
                            />
                            <Text mt={4} fontSize='xl' fontWeight='bold'>
                              {queueItems[0]?.songName}
                            </Text>
                            <Text fontSize='lg' color='gray.400'>
                              by {queueItems[0]?.artistName}
                            </Text>
                          </>
                        ) : (
                          <Music size={64} color='teal' />
                        )}
                      </Box>
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
      )}
    </>
  );
}

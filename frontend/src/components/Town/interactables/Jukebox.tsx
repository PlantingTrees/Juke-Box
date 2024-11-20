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
} from '@chakra-ui/react';
import useTownController from '../../../hooks/useTownController';
import JukeboxSearch from './JukeboxComponents/JukeboxSearch';
import { Song } from '../../../../../shared/types/CoveyTownSocket';

export default function JukeboxArea(): JSX.Element {
  const jukeboxArea = useInteractable<JukeboxAreaInteractable>('jukeboxArea');
  const coveyTownController = useTownController();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [songImage, setSongImage] = useState('');

  const [queueItems, setQueueItems] = useState<Song[]>([]);

  // TODO get queue data from users whose id is not the one playing the song, so if Kingsley plays song,
  // and Kevin wants to play a song kevin can only search the song but CANNOT interupt the song currently playing

  const closeModal = useCallback(() => {
    if (jukeboxArea) {
      coveyTownController.interactEnd(jukeboxArea);
    }
  }, [coveyTownController, jukeboxArea]);

  useEffect(() => {
    if (jukeboxArea) {
      setIsOpen(true);
    }
  }, [jukeboxArea]);

  const addSongToQueue = (song: Song) => {
    setQueueItems(prevQueue => [...prevQueue, song]);
  };

  return (
    <>
      {jukeboxArea && (
        <Modal
          isOpen={isOpen}
          onClose={() => {
            closeModal();
            coveyTownController.unPause();
          }}
          size='2xl'>
          <ModalOverlay />
          <ModalContent maxW='900px'>
            <ModalHeader>Juke Box</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid templateColumns='repeat(2, 1fr)' gap={6}>
                <GridItem>
                  <VStack spacing={4} align='stretch'>
                    <JukeboxSearch setQueueItems={addSongToQueue} />
                    <HStack spacing={4} p={2} bg='gray.100' borderRadius='md'>
                      <IconButton
                        icon={volume === 0 ? <VolumeX /> : <Volume2 />}
                        aria-label='Toggle mute'
                        onClick={() => setVolume(volume === 0 ? 50 : 0)}
                      />
                      <Slider value={volume} onChange={setVolume} min={0} max={100} flex={1}>
                        <SliderTrack bg='green.100'>
                          <SliderFilledTrack bg='green.500' />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </HStack>
                  </VStack>
                </GridItem>

                <GridItem>
                  <VStack spacing={4} height='100%'>
                    {isQueueVisible ? (
                      // Queue View
                      <Box width='100%'>
                        <VStack
                          spacing={3}
                          align='stretch'
                          bg='gray.50'
                          p={4}
                          borderRadius='md'
                          height='300px'
                          overflowY='auto'>
                          {queueItems.map((song, index) => (
                            <HStack
                              key={index}
                              p={3}
                              bg='white'
                              borderRadius='md'
                              boxShadow='sm'
                              _hover={{ bg: 'gray.50' }}>
                              <Box w={2} h={2} borderRadius='full' bg='blue.500' />
                              <Text flex={1}>{song.songName}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    ) : (
                      // Song View
                      <Box
                        bg='gray.200'
                        width='100%'
                        height='300px'
                        borderRadius='md'
                        display='flex'
                        justifyContent='center'
                        alignItems='center'>
                        {queueItems.length > 0 ? (
                          <Box textAlign='center' width='fit-content' mx='auto'>
                            <Text fontSize='lg' fontWeight='bold' mb={2}>
                              Currently Playing:
                            </Text>
                            <Image
                              src={queueItems[0]?.artworkUrl || '/mySongAPIPlaceHolder.png'}
                              alt='Song artwork'
                              boxSize='200px'
                              objectFit='cover'
                              borderRadius='md'
                              mx='auto'
                            />
                            <Text mt={2} fontSize='md' fontWeight='semibold' textAlign='center'>
                              {queueItems[0]?.songName}
                            </Text>
                            <Text mt={1} fontSize='sm' color='gray.600' textAlign='center'>
                              by {queueItems[0]?.artistName}
                            </Text>
                          </Box>
                        ) : (
                          <Music size={64} color='#1a365d' />
                        )}
                      </Box>
                    )}

                    <Button
                      onClick={() => setIsQueueVisible(!isQueueVisible)}
                      variant='solid'
                      colorScheme='green'
                      width='100%'
                      size='lg'>
                      {isQueueVisible ? 'SHOW SONG' : 'SHOW QUEUE'}
                    </Button>
                  </VStack>
                </GridItem>
              </Grid>
            </ModalBody>
            <ModalFooter />
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

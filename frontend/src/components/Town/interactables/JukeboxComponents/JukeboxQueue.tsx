import { Song } from '../../../../types/CoveyTownSocket';
import { Box, HStack, Text, Image, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import { SpotifySong } from './JukeboxSearch';

export default function JukeboxQueue({ currentQueue }: { currentQueue: SpotifySong[] }): JSX.Element {
  const [hoveredSong, setHoveredSong] = useState<SpotifySong | null>(null);
 


  
  const waitTime = (index: number) => {
    if (index === 0) {
      return 'Now Playing';
    }
    const totalSeconds = Math.floor(currentQueue[index].songDurationSec / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    const duration = `${minutes}:${formattedSeconds}`;
    return 'Duration: ' + duration;
  };

  return (
    <Box position='relative'>
      <Box bg='gray.800' borderRadius='lg' p={4} maxHeight='350px' overflowY='auto'>
        {currentQueue.length > 0 ? (
          currentQueue.map((song, index) => (
            <HStack
              key={index}
              spacing={4}
              p={3}
              borderRadius='md'
              bg='gray.700'
              _hover={{ bg: 'gray.600' }}
              alignItems='center'
              onMouseEnter={() => setHoveredSong(song)}
              onMouseLeave={() => setHoveredSong(null)}>
              <Box
                w='10px'
                h='10px'
                borderRadius='full'
                bg={index === 0 ? 'green.400' : 'blue.400'}
              />
              <Text fontSize='lg' fontWeight='bold' flex={1}>
                {song.name} - {song.artists[0]}
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

      {hoveredSong && (
        <Box
          position='absolute'
          bottom='-150px'
          left='50%'
          transform='translateX(-50%)'
          bg='gray.900'
          color='white'
          p={4}
          borderRadius='md'
          boxShadow='lg'
          zIndex='overlay'>
          <HStack spacing={4}>
            <Image
              src={hoveredSong.album.images[0].url|| '/placeholder.png'}
              alt='Song cover art'
              boxSize='80px'
              borderRadius='full'
            />
            <VStack align='start' spacing={0.5}>
              <Text fontWeight='bold'>{hoveredSong.name}</Text>
              <Text fontSize='sm'>Artist: {hoveredSong.artists[0].name}</Text>
              <Text fontSize='sm'>Album: {hoveredSong.album.name}</Text>
              <Text fontSize='sm'>
                Duration: {Math.floor(hoveredSong.duration_ms / 60000)}:
                {Math.floor((hoveredSong.duration_ms % 60000) / 1000)
                  .toString()
                  .padStart(2, '0')}
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}
    </Box>
  );
}

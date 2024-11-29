import { Song } from '../../../../types/CoveyTownSocket';
import { Box, HStack, Text } from '@chakra-ui/react';
import React from 'react';

export default function JukeboxQueue({ currentQueue }: { currentQueue: Song[] }): JSX.Element {
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
    <>
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
    </>
  );
}

import React from 'react';
import { Text, Image, Box } from '@chakra-ui/react';
import { Music } from 'lucide-react';
import { SpotifySong } from './JukeboxSearch';

export default function JukeboxSong({ currentQueue }: { currentQueue: SpotifySong[] }): JSX.Element {
  return (
    <>
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
        {currentQueue.length > 0 ? (
          <>
            <Text fontSize='lg' fontWeight='bold' mb={2}>
              Currently Playing:
            </Text>
            <Image
              src={currentQueue[0]?.album.images[0].url || '/placeholder.png'}
              alt='Song artwork'
              boxSize='200px'
              objectFit='cover'
              borderRadius='md'
            />
            <Text mt={4} fontSize='xl' fontWeight='bold'>
              {currentQueue[0]?.name}
            </Text>
            <Text fontSize='lg' color='gray.400'>
              by {currentQueue[0]?.artists[0].name}
            </Text>
          </>
        ) : (
          <Music size={64} color='teal' />
        )}
      </Box>
    </>
  );
}

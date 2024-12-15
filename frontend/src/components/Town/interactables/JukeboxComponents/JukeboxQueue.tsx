import { Box, Button, HStack, Image, Text, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { SpotifySong } from './JukeboxSearch';
import { BsMusicNoteBeamed } from 'react-icons/bs';

interface JukeboxQueueProps {
  currentQueue: SpotifySong[];
}

const JukeboxQueue = React.memo(({ currentQueue }: JukeboxQueueProps) => {
  const [hoveredSong, setHoveredSong] = useState<SpotifySong | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isQueueVisible, setIsQueueVisible] = useState(false); // Initially, Song view is visible

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const waitTime = (index: number) => {
    if (index === 0) {
      return 'Now Playing';
    }
    const totalSeconds = Math.floor(currentQueue[index].duration_ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    const duration = `${minutes}:${formattedSeconds}`;
    return 'Duration: ' + duration;
  };

  const renderContent = () => {
    if (isQueueVisible) {
      // List view: Show the queue of songs
      return (
        <Box bg="gray.800" borderRadius="lg" p={4} maxHeight="350px" overflowY="auto">
          {currentQueue.length > 0 ? (
            currentQueue.map((song, index) => (
              <HStack
                key={index}
                spacing={4}
                p={3}
                borderRadius="md"
                bg="gray.700"
                _hover={{ bg: 'gray.600' }}
                alignItems="center"
                onMouseEnter={() => setHoveredSong(song)}
                onMouseLeave={() => setHoveredSong(null)}
              >
                <Box
                  w="10px"
                  h="10px"
                  borderRadius="full"
                  bg={index === 0 ? 'green.400' : 'blue.400'}
                />
                <Text fontSize="lg" fontWeight="bold" flex={1}>
                  {song.name} - {song.artists[0].name}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {waitTime(index)}
                </Text>
              </HStack>
            ))
          ) : (
            <Text fontSize="lg" fontWeight="bold">
              No song in Queue.
            </Text>
          )}
        </Box>
      );
    } else {
      // Image view: Show the current playing song
      if (currentQueue.length > 0) {
        const currentSong = currentQueue[0];
        return (
          <Box bg="gray.800" borderRadius="lg" p={4}>
            <VStack spacing={4} align="stretch">
              <Image
                src={currentSong.album.images[0].url || '/placeholder.png'}
                alt="Currently playing song cover"
                alignSelf="center"
                boxSize="200px"
                borderRadius="md"
              />
              <VStack spacing={2} align="center">
                <Text fontSize="xl" fontWeight="bold">
                  {currentSong.name}
                </Text>
                <Text fontSize="md">By {currentSong.artists[0].name}</Text>
              </VStack>
            </VStack>
          </Box>
        );
      } else {
        return (
          <Box bg="gray.800" borderRadius="lg" p={4} maxHeight="350px" overflowY="auto">
            <VStack spacing={4} align="center" justify="center" height="200px">
              <BsMusicNoteBeamed size="48px" color="gray.500" />
              <Text fontSize="lg" color="gray.400">
                No song is currently playing.
              </Text>
            </VStack>
          </Box>
        );
      }
    }
  };

  return (
    <Box position="relative">
      {renderContent()}

      {hoveredSong && (
        <Box
          position="fixed"
          top={`${mousePosition.y + 10}px`}
          left={`${mousePosition.x + 20}px`}
          bg="gray.900"
          color="white"
          p={4}
          borderRadius="md"
          boxShadow="lg"
          zIndex="overlay"
          pointerEvents="none"
          transform="translateY(-10%)"
        >
          <HStack spacing={4}>
            <Image
              src={hoveredSong.album.images[0].url || '/placeholder.png'}
              alt="Song cover art"
              boxSize="80px"
              borderRadius="full"
            />
            <VStack align="start" spacing={0.5}>
              <Text fontWeight="bold">{hoveredSong.name}</Text>
              <Text fontSize="sm">Artist: {hoveredSong.artists[0].name}</Text>
              <Text fontSize="sm">Album: {hoveredSong.album.name}</Text>
              <Text fontSize="sm">
                Duration: {Math.floor(hoveredSong.duration_ms / 60000)}:
                {Math.floor((hoveredSong.duration_ms % 60000) / 1000)
                  .toString()
                  .padStart(2, '0')}
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}

      <Button
        onClick={() => setIsQueueVisible(!isQueueVisible)} // Toggle between Song view and Queue view
        variant="solid"
        colorScheme="teal"
        size="lg"
        width="100%"
        mt={4}
      >
        {isQueueVisible ? 'Show Song' : 'Show Queue'} {/* Toggle button text */}
      </Button>
    </Box>
  );
});

export default JukeboxQueue;

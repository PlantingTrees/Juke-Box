import React, { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import {
  Input,
  Text,
  VStack,
  Box,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Spinner,
} from '@chakra-ui/react';

// Define a specific type for Spotify songs
export interface SpotifySong {
  songDurationSec: number;
  duration_ms: number;
  uri: string;
  name: string;
  artists: { name: string }[];
  album: {
    images: any; name: string 
};
}

export default function JukeboxSearch({
  setQueueItems,
}: {
  setQueueItems: (song: SpotifySong) => void;
}): JSX.Element {
  const [results, setResults] = useState<SpotifySong[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const jukeboxToast = useToast();

  const searchSpotify = async (accessToken: string, user_query: string) => {
    if (!user_query.trim()) return;
    console.log('searching for:', user_query);
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(user_query)}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Error fetching data from Spotify API');
      }

      const data = await response.json();
      console.log(data.tracks.items);
      setResults(data.tracks.items);
    } catch(error) {
      jukeboxToast({
        description: 'Search Failed.',
        status: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchForTracks = async (query: string) => {
    const accessToken = localStorage.getItem('spotify-access-token');
    if (!accessToken) {
      console.error('Access token not found');
      return;
    }

    await searchSpotify(accessToken, query);
  };

  const addSong = useCallback(
    (song: SpotifySong) => {
      try {
        setQueueItems(song); // Add selected song to the queue
      } catch (error) {
        jukeboxToast({
          description: `${error}`,
          status: 'error',
        });
      }
    },
    [setQueueItems],
  );

  return (
    <>
      <Box bg='gray.100' p={4} borderRadius='md'>
        <InputGroup size='md'>
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Search for songs...'
            bg='white'
            onKeyDown={e => {
              e.stopPropagation(); 
              if (e.key === 'Enter') {
                searchForTracks(query); 
              }
            }}
          />
          <InputRightElement>
            <IconButton
              icon={<Search size={20} />}
              aria-label='Search'
              size='sm'
              variant='ghost'
              onClick={() => searchForTracks(query)}
              _hover={{ bg: 'gray.200' }}
            />
          </InputRightElement>
        </InputGroup>
      </Box>

      <Box flex={1} overflowY='auto' maxH='300px' borderRadius='md' bg='gray.50' p={2}>
        {isLoading ? (
          <Box display='flex' justifyContent='center' alignItems='center' height='100%'>
            <Spinner size='lg' color='blue.500' />
          </Box>
        ) : (
          <VStack align='stretch' spacing={2}>
            {results.map((result, index) => (
              <Box
                key={index}
                p={2}
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                _hover={{ bg: 'gray.100' }}
                borderRadius='md'>
                <Box flex='1' cursor='pointer' onClick={() => addSong(result)}>
                  <Text>
            
                    {result.name} - {result.artists[0].name} | {result.album.name}
                  </Text>
                </Box>
                <Box>
                  <IconButton
                    aria-label='Add to queue'
                    icon={<Text fontSize='xl'>+</Text>}
                    size='sm'
                    variant='ghost'
                    onClick={() => addSong(result)}
                    _hover={{ bg: 'gray.200' }}
                  />
                </Box>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </>
  );
}
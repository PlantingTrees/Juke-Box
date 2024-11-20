import React, { useCallback, useState } from 'react';
import { Song } from '../../../../types/CoveyTownSocket';
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
} from '@chakra-ui/react';
import axios from 'axios';

export default function JukeboxSearch({
  setQueueItems,
}: {
  setQueueItems: (song: Song) => void;
}): JSX.Element {
  const [results, setResults] = useState<Song[]>([]);
  const [query, setQuery] = useState('');
  const jukeboxToast = useToast();

  const backendURL = process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL;

  // Function to handle search and make a call to the backend
  const handleSearch = async () => {
    if (!query.trim()) return; // Do nothing for empty queries
    try {
      const response = await axios.get(`${backendURL}/jukebox/search`, {
        params: { query }, // Query parameter sent to the backend
      });

      // Update state with search results
      setResults(response.data); // Ensure backend returns results in Song[] format
    } catch (error) {
      console.error('Search failed:', error);
      jukeboxToast({
        description: 'Failed to fetch search results. Please try again.',
        status: 'error',
      });
    }
  };

  const addSong = useCallback(
    async (song: Song) => {
      try {
        setQueueItems(song); // Add selected song to the queue
      } catch (error) {
        jukeboxToast({
          description: `${error}`,
          status: `error`,
        });
      }
    },
    [jukeboxToast, setQueueItems],
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
              // Prevent default behavior and stop propagation
              e.stopPropagation(); // Prevents the event from reaching global handlers
              if (e.key === 'Enter') {
                handleSearch(); // Trigger search on Enter key
              }
            }}
          />
          <InputRightElement>
            <IconButton
              icon={<Search size={20} />}
              aria-label='Search'
              size='sm'
              variant='ghost'
              onClick={handleSearch} // Trigger search on button click
              _hover={{ bg: 'gray.200' }}
            />
          </InputRightElement>
        </InputGroup>
      </Box>

      <Box flex={1} overflowY='auto' maxH='300px' borderRadius='md' bg='gray.50' p={2}>
        <VStack align='stretch' spacing={2}>
          {results.map((result, index) => (
            <Box
              key={index}
              p={2}
              _hover={{ bg: 'gray.100' }}
              cursor='pointer'
              borderRadius='md'
              onClick={() => addSong(result)}>
              <Text>
                {result.songName} - {result.artistName} | {result.albumName}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </>
  );
}

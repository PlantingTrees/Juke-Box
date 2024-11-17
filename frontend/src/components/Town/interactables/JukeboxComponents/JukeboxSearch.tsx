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

export default function JukeboxSearch({
  setQueueItems,
}: {
  setQueueItems: (song: Song) => void;
}): JSX.Element {
  const [results, setResults] = useState<Song[]>([]);
  const [query, setQuery] = useState('');

  const jukeboxToast = useToast();

  const travisScottResult: Song = {
    songName: 'Never Catch Me',
    songDurationSec: 176160,
    albumName: 'Rodeo',
    artistName: 'Travis Scott',
    artworkUrl: 'https://i.scdn.co/image/ab67616d0000b2736cfd9a7353f98f5165ea6160',
    trackUri: 'spotify:track:3jg8bevUzKYONDLBBQquif',
  };

  const uncleMResult: Song[] = [
    {
      songName: 'Uncle M',
      songDurationSec: 140000,
      albumName: 'BUSINESS IS BUSINESS',
      artistName: 'Young Thug',
      artworkUrl: 'https://i.scdn.co/image/ab67616d0000b27337895eee206eabf2682e3064',
      trackUri: 'spotify:track:612Gkl43RQdwlzKGPgkudm',
    },
    {
      songName: 'Uncle M',
      songDurationSec: 140000,
      albumName: "BUSINESS IS BUSINESS (Metro's Version)",
      artistName: 'Young Thug',
      artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273316d28de9974e2f39636288c',
      trackUri: 'spotify:track:2BR4cE9udCDcvZ2HtuLv3N',
    },
    {
      songName: 'Far From Lies',
      songDurationSec: 208810,
      albumName: 'Now Or Never',
      artistName: 'Unclekamo',
      artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273e0670854e8b9e3fae5d44bb2',
      trackUri: 'spotify:track:3z11aKXKMHll56LO6iNI6A',
    },
    {
      songName: 'Uncle M',
      songDurationSec: 140000,
      albumName: 'BUSINESS IS BUSINESS',
      artistName: 'Young Thug',
      artworkUrl: 'https://i.scdn.co/image/ab67616d0000b273248ee3b391f1d665113b146a',
      trackUri: 'spotify:track:12W6EfKhq8rzCUQxgbr6ev',
    },
    {
      songName: 'Get The Strap (feat. Casanova, 6ix9ine & 50 Cent)',
      songDurationSec: 190514,
      albumName: 'Get The Strap (feat. Casanova, 6ix9ine & 50 Cent)',
      artistName: 'Uncle Murda',
      artworkUrl: 'https://i.scdn.co/image/ab67616d0000b27373d56cc1d8ec8f73ce7bfd40',
      trackUri: 'spotify:track:4FC2oIKWbXNOq6NThyFxSQ',
    },
  ];

  const handleSearch = async () => {
    let mockResults: Song[] = [];
    if (!query.trim()) return;
    try {
      if (query === 'Travis Scott') {
        mockResults = [travisScottResult];
      } else if (query === 'Uncle M') {
        mockResults = uncleMResult;
      }
      setResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const addSong = useCallback(
    async (song: Song) => {
      try {
        setQueueItems(song);
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
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <InputRightElement>
            <IconButton
              icon={<Search size={20} />}
              aria-label='Search'
              size='sm'
              variant='ghost'
              onClick={handleSearch}
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

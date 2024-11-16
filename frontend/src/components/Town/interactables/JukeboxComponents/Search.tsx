import React, { useState } from 'react';
import JukeboxAreaController from '../../../../classes/JukeboxAreaController';
import {
  Input,
  List,
  ListItem,
  ListIcon,
  UnorderedList,
  Button,
  GridItem,
  VStack,
  Box,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';

export default function Search({
  jukeboxArea,
}: {
  jukeboxArea: JukeboxAreaController;
}): JSX.Element {
  // const [isSearching, setSearching] = useState(false);
  const [results, setResults] = useState(jukeboxArea.results);
  const [query, setQuery] = useState('');

  return (
    <>
      <GridItem>
        <VStack spacing={4} align='stretch'>
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
                  _hover={{ bg: 'gray.200' }}
                />
              </InputRightElement>
            </InputGroup>
          </Box>

          <Box flex={1} overflowY='auto' maxH='300px' borderRadius='md' bg='gray.50' p={2}>
            <VStack align='stretch' spacing={2}>
              {searchResults.map((result, index) => (
                <Box
                  key={index}
                  p={2}
                  _hover={{ bg: 'gray.100' }}
                  cursor='pointer'
                  borderRadius='md'
                  onClick={() => setSelectedSong(result)}>
                  <Text>{result}</Text>
                </Box>
              ))}
            </VStack>
          </Box>
        </VStack>
      </GridItem>
    </>
  );
}

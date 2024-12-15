import React, { useCallback, useEffect, useState } from 'react';
import {
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import JukeboxAreaInteractable from './JukeboxArea';
import JukeboxPlayer from './JukeboxComponents/JukeboxPlayer';
import JukeboxQueue from './JukeboxComponents/JukeboxQueue';
import JukeboxSearch, { SpotifySong } from './JukeboxComponents/JukeboxSearch';

export function JukeboxArea({
  jukeboxArea,
}: {
  jukeboxArea: JukeboxAreaInteractable;
}): JSX.Element {
  
  const [elapsedTime, setElapsedTime] = useState(0); // Elapsed time for the current song
  const coveyTownController = useTownController();
  const [isOpen, setIsOpen] = useState(false);
  const [songQueue, setSongQueue] = useState<SpotifySong[]>([]); // Shared across multiple components
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

  const handleSearchQueue = useCallback(song => {
    setSongQueue(prevQueue => [...prevQueue, song]);
  }, []);

  const handleOnSongEnds = useCallback(() => {
    if (!songQueue.length) {
      console.log('Queue is empty, cannot remove song.');
      return;
    }
    const newQueue = songQueue.slice(1); 
    setSongQueue(newQueue);
    setElapsedTime(0); 
  }, [songQueue]);


  removeSongFromQueue();

  
  useEffect(() => {
    console.log('Current queue:', songQueue);
  }, [songQueue]);

  return (
    <>
      {jukeboxArea && (
        <Modal
          isOpen={isOpen}
          onClose={() => {
            closeModal();
            coveyTownController.unPause();
          }}
          size="4xl"
        >
          <ModalOverlay />
          <ModalContent
            bg="linear-gradient(135deg, #1f1f1f, #282828)"
            color="white"
            borderRadius="lg"
            p={6}
            maxWidth="1200px"
            boxShadow="xl"
          >
            <ModalHeader fontSize="2xl" fontWeight="bold" borderBottom="1px solid gray">
              Covey.Town Jukebox
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody>
              <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                {/* Left Panel: Search and Volume */}
                <JukeboxSearch onSongSelected={handleSearchQueue} />
                {/* Right Panel: Current Song or Queue */}
                <JukeboxQueue currentQueue={songQueue} />
                {songQueue && songQueue.length > 0 && songQueue[0]?.uri ? (
                  <JukeboxPlayer
                    songURI={songQueue[0].uri}
                  />
                ) : null}
              </Grid>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );

  function removeSongFromQueue() {
    useEffect(() => {
      if (songQueue.length === 0 || !songQueue[0]?.duration_ms) {
        setElapsedTime(0);
        return;
      }

      const currentSongDuration = Math.floor(songQueue[0].duration_ms / 1000); // Convert ms to seconds

      const interval = setInterval(() => {
        setElapsedTime(prevElapsedTime => {
          if (prevElapsedTime >= currentSongDuration) {
            clearInterval(interval);
            handleOnSongEnds();
            return 0;
          }
          return prevElapsedTime + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }, [songQueue, handleOnSongEnds]);
  }
}

export default function JukeboxAreaWrapper(): JSX.Element {
  const jukeboxArea = useInteractable<JukeboxAreaInteractable>('jukeboxArea');
  if (jukeboxArea) {
    return <JukeboxArea jukeboxArea={jukeboxArea} />;
  }
  return <></>;
}

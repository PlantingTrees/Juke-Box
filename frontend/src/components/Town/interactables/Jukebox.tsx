import React, { useState } from 'react';
import JukeboxAreaInteractable from './JukeboxArea';
import { useInteractable } from '../../../classes/TownController';
import {
  Modal,
  ModalOverlay,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalContent,
  Button,
} from '@chakra-ui/react';
import JukeboxAreaController from '../../../classes/JukeboxAreaController';

function JukeboxArea({ jukeboxArea }: { jukeboxArea: JukeboxAreaInteractable }): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);

  return (
    <>
      <Button onClick={onOpen}>Open Jukebox</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader>Jukebox</ModalHeader>
          <ModalBody>
            <p>Here you can control the jukebox!</p>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function JukeboxAreaWrapper(): JSX.Element {
  const jukeboxArea = useInteractable<JukeboxAreaInteractable>('jukeboxArea');

  if (jukeboxArea) {
    <JukeboxArea jukeboxArea={jukeboxArea} />;
  }
  return <></>;
}

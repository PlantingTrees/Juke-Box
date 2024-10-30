import { Modal, ModalOverlay, ModalHeader, ModalContent, ModalCloseButton } from '@chakra-ui/react';
import JukeboxAreaInteractable from './JukeboxArea';
import { useInteractable } from '../../../classes/TownController';
import React, { useEffect, useState } from 'react';

export default function JukeboxModalWrapper(): JSX.Element {
  const jukeboxArea = useInteractable<JukeboxAreaInteractable>('jukeboxArea');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (jukeboxArea) {
      setIsOpen(true);
    }
  }, [jukeboxArea]);

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{'Covey Jukebox'}</ModalHeader>
        <ModalCloseButton />
      </ModalContent>
    </Modal>
  );
}

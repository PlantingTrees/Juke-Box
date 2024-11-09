import React, { useState, useEffect, useCallback } from 'react';
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
import useTownController from '../../../hooks/useTownController';

export default function JukeboxArea(): JSX.Element {
  const jukeboxArea = useInteractable<JukeboxAreaInteractable>('jukeboxArea');
  const coveyTownController = useTownController();
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = useCallback(() => {
    if (jukeboxArea) {
      coveyTownController.interactEnd(jukeboxArea);
    }
  }, [coveyTownController, jukeboxArea]);

  // Automatically open the modal when jukeboxArea is available
  useEffect(() => {
    if (jukeboxArea) {
      setIsOpen(true);
    }
  }, [jukeboxArea]);

  return (
    <>
      {jukeboxArea && (
        <Modal
          isOpen={isOpen}
          onClose={() => {
            closeModal();
            coveyTownController.unPause();
          }}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>Jukebox</ModalHeader>
            <ModalBody>
              <p>Here you can control the jukebox!</p>
            </ModalBody>
            <ModalFooter>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

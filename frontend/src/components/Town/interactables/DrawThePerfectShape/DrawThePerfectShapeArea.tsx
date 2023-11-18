import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
} from '@chakra-ui/react';
import { DrawThePerfectShapeDifficulty, InteractableID } from '../../../../types/CoveyTownSocket';
import React, { useCallback, useEffect, useState } from 'react';
import GameAreaInteractable from '../GameArea';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import Canvas from './Canvas';
import DrawThePerfectShapeController from '../../../../classes/interactable/DrawThePerfectShape/DrawThePerfectShapeAreaController';

function DrawThePerfectShapeArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<DrawThePerfectShapeController>(interactableID);
  const [playerOne, setPlayerOne] = useState<string | undefined>('Waiting For Player');
  const [playerTwo, setPlayerTwo] = useState('Waiting For Player');

  const [difficulty, setDifficulty] = useState<string>('Easy');
  const [pressedStart, setPressedStart] = useState<boolean>(false); // has the start button been pressed

  /**
   * Handles when a user presses the 'Join Game' button
   */
  const handleJoinGame = async () => {
    try {
      await gameAreaController.joinGame();
    } catch (err) {
      console.log('error');
    }
  };

  /**
   * Handles when a user presses the 'Start Game' button
   */
  const handleStartGame = async () => {
    try {
      await gameAreaController.startGame();
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Handles when a user presses the 'Leave Game' button
   */
  const handleLeaveGame = async () => {
    try {
      await gameAreaController.leaveGame();
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Handles when a user presses the 'Change Difficulty' button
   */
  const handleChangeDifficulty = async (newDifficulty: string) => {
    setDifficulty(newDifficulty);
    try {
      await gameAreaController.pickDifficulty(newDifficulty as DrawThePerfectShapeDifficulty);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    function updateGameState() {
      setPlayerOne(gameAreaController.playerOne?.userName);
    }

    gameAreaController.addListener('gameUpdated', updateGameState);
    return () => {
      gameAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [gameAreaController]);

  const areaStyles: React.CSSProperties = { width: '100%', height: '600px' };
  const canvasRowStyles: React.CSSProperties = {
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  };

  const canvasStyles: React.CSSProperties = {
    marginTop: '20px',
    marginLeft: '50px',
    color: '#00F',
    fontSize: '15px',
    fontWeight: 'bolder',
  };
  const area = (
    <div style={areaStyles}>
      <div style={canvasRowStyles}>
        <div style={canvasStyles}>
          Player 1: {playerOne}
          <Canvas penColor='blue' canPaint={true} />
        </div>

        <div
          style={{
            marginTop: '20px',
            marginRight: '50px',
            color: '#F00',
            fontSize: '15px',
            fontWeight: 'bolder',
          }}>
          Player 2: {playerTwo}
          <Canvas penColor='red' canPaint={false} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <select
          value={difficulty}
          onChange={event => {
            handleChangeDifficulty(event.target.value);
          }}>
          <option value='Easy'>Easy</option>
          <option value='Medium'>Medium</option>
          <option value='Hard'>Hard</option>
        </select>
        <button
          style={{
            marginTop: '80px',
            marginLeft: 'auto',
            marginRight: '10px',
            color: '#FFF',
            backgroundColor: '#008000',
            padding: '5px',
            borderRadius: '20px',
          }}
          onClick={async () => {
            try {
              await gameAreaController.joinGame();
            } catch (err) {
              console.log('error');
            }
          }}>
          Join Game
        </button>
      </div>
    </div>
  );
  return area;
}

export default function DrawThePerfectShapeAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

  if (gameArea && gameArea.getData('type') === 'DrawThePerfectShape') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false} size='5xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />
          <DrawThePerfectShapeArea interactableID={gameArea.name} />;
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}

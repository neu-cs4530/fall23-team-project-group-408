import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
} from '@chakra-ui/react';
import {
  DrawThePerfectShapeDifficulty,
  DrawThePerfectShapePixel,
  DrawThePerfectShapeShape,
  GameStatus,
  InteractableID,
} from '../../../../types/CoveyTownSocket';
import React, { useCallback, useEffect, useState } from 'react';
import GameAreaInteractable from '../GameArea';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import Canvas from './Canvas';
import DrawThePerfectShapeController from '../../../../classes/interactable/DrawThePerfectShape/DrawThePerfectShapeAreaController';
import { use } from 'matter';
import { set } from 'lodash';
import { send } from 'process';
function DrawThePerfectShapeArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<DrawThePerfectShapeController>(interactableID);
  const [playerOne, setPlayerOne] = useState<string | undefined>(
    gameAreaController.playerOne?.userName,
  );
  const [playerTwo, setPlayerTwo] = useState<string | undefined>(
    gameAreaController.playerTwo?.userName,
  );
  const [status, setStatus] = useState<GameStatus>('WAITING_TO_START'); // ['Waiting For Players', 'Game In Progress', 'Game Over'
  const [difficulty, setDifficulty] = useState<string>('Easy');
  const [pressedStart, setPressedStart] = useState<boolean>(false); // has the start button been pressed
  const [traceShape, setTraceShape] = useState<DrawThePerfectShapeShape | undefined>(
    gameAreaController.traceShape,
  ); // the shape to be traced

  const [timer, setTimer] = useState<number>(gameAreaController.timer); // the timer for the game

  const [player1FrontendPixels, setPlayer1FrontendPixels] = useState<DrawThePerfectShapePixel[]>(
    [],
  );
  const [player2FrontendPixels, setPlayer2FrontendPixels] = useState<DrawThePerfectShapePixel[]>(
    [],
  );

  const [player1BackendPixels, setPlayer1BackendPixels] = useState<DrawThePerfectShapePixel[]>([]);
  const [player2BackendPixels, setPlayer2BackendPixels] = useState<DrawThePerfectShapePixel[]>([]);

  /**
   * Handles when a user presses the 'Join Game' button
   */
  const handleJoinGame = async () => {
    try {
      await gameAreaController.joinGame();
      setTraceShape(gameAreaController.traceShape);
    } catch (err) {
      console.log('error');
    }
  };

  /**
   * Handles when a user presses the 'Start Game' button
   */
  const handleStartGame = async () => {
    try {
      setPressedStart(true);
      await gameAreaController.startGame();
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
      setPlayerTwo(gameAreaController.playerTwo?.userName);
      setStatus(gameAreaController.status);
    }
    function onGameEnd() {
      console.log('game ended');
    }

    gameAreaController.addListener('gameUpdated', updateGameState);
    gameAreaController.addListener('difficultyChanged', setDifficulty);
    gameAreaController.addListener('traceShapeChanged', setTraceShape);
    gameAreaController.addListener('timerChanged', setTimer);
    gameAreaController.addListener('playerOnePixelChanged', setPlayer1BackendPixels);
    gameAreaController.addListener('playerTwoPixelChanged', setPlayer2BackendPixels);
    gameAreaController.addListener('gameEnd', onGameEnd);

    return () => {
      gameAreaController.removeListener('gameEnd', onGameEnd);
      gameAreaController.removeListener('gameUpdated', updateGameState);
      gameAreaController.removeListener('difficultyChanged', setDifficulty);
      gameAreaController.removeListener('traceShapeChanged', setTraceShape);
      gameAreaController.removeListener('timerChanged', setTimer);
    };
  }, [gameAreaController]);

  useEffect(() => {
    const myFunction = async () => {
      await gameAreaController.makeMove(1, player1FrontendPixels);
      setPlayer1FrontendPixels([]);
    };
    if (timer > 0 && status === 'IN_PROGRESS' && pressedStart) {
      const intervalId = setInterval(myFunction, 1000); // 500 milliseconds (half a second)
      return () => clearInterval(intervalId);
    }
  }, [gameAreaController, status, timer, pressedStart, player1FrontendPixels]);

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
    fontSize: '15px',
    fontWeight: 'bolder',
  };

  const buttonStyles: React.CSSProperties = {
    marginTop: '80px',
    marginLeft: 'auto',
    marginRight: '10px',

    color: '#FFF',
    padding: '5px',
    borderRadius: '20px',
  };

  const area = (
    <div style={areaStyles}>
      Game Status: {status}
      {status === 'IN_PROGRESS' && <div>{gameAreaController.traceShape?.title}</div>}
      <div>Timer: {Math.trunc(timer)}</div>
      <div style={canvasRowStyles}>
        <div style={{ ...canvasStyles, marginLeft: '50px', color: '#00F' }}>
          Player 1: {playerOne ? playerOne : 'Waiting For Player'}
          <Canvas
            penColor='blue'
            canPaint={gameAreaController.isPlayerOne}
            tracePixels={traceShape ? traceShape.pixels : []}
            frontendPixels={player1FrontendPixels}
            sendPixels={setPlayer1FrontendPixels}
          />
        </div>
        <div style={{ ...canvasStyles, marginRight: '50px', color: '#F00' }}>
          Player 2: {playerTwo ? playerTwo : 'Waiting For Player'}
          {gameAreaController.isPlayerTwo && (
            <Canvas
              penColor='red'
              canPaint={gameAreaController.isPlayerTwo}
              tracePixels={traceShape ? traceShape.pixels : []}
            />
          )}
          {gameAreaController.isPlayerOne && (
            <Canvas
              penColor='red'
              canPaint={false}
              tracePixels={traceShape ? traceShape.pixels : []}
              backendPixels={player1BackendPixels}
            />
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {gameAreaController.isPlayer && status === 'IN_PROGRESS' && !pressedStart && (
          <select
            value={difficulty}
            onChange={event => {
              handleChangeDifficulty(event.target.value);
            }}>
            <option value='Easy'>Easy</option>
            <option value='Medium'>Medium</option>
            <option value='Hard'>Hard</option>
          </select>
        )}
        {status !== 'IN_PROGRESS' && !gameAreaController.isPlayer && (
          <button
            style={{ ...buttonStyles, backgroundColor: '#00F' }}
            onClick={async () => handleJoinGame()}>
            Join Game
          </button>
        )}
        {gameAreaController.isPlayer && status === 'IN_PROGRESS' && !pressedStart && (
          <button
            style={{ ...buttonStyles, backgroundColor: '#F00' }}
            onClick={async () => handleStartGame()}>
            Start Game
          </button>
        )}
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

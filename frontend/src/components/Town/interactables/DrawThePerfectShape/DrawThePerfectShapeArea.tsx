import { Box, Button, Container, Flex, HStack, Spacer, VStack } from '@chakra-ui/react';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import React, { useEffect, useState } from 'react';

import Canvas from '../Canvas';
import { useInteractableAreaController } from '../../../../classes/TownController';
import TicTacToeAreaController from '../../../../classes/interactable/TicTacToeAreaController';
export default function DrawThePerfectShapeArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController = useInteractableAreaController<TicTacToeAreaController>(interactableID);
  const [playerOne, setPlayerOne] = useState<string | undefined>('Waiting For Player');
  const [playerTwo, setPlayerTwo] = useState('Waiting For Player');

  useEffect(() => {
    function updateGameState() {
      setPlayerOne(gameAreaController.x?.userName);
    }

    gameAreaController.addListener('gameUpdated', updateGameState);
    return () => {
      gameAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [gameAreaController]);
  const page = (
    <div
      style={{
        width: '100%',
        height: '600px',
      }}>
      <div
        style={{
          width: '100%',
          height: 'fit-content',
          // border: '1px solid #000',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <div
          style={{
            marginTop: '20px',
            marginLeft: '50px',
            color: '#00F',
            fontSize: '15px',
            fontWeight: 'bolder',
          }}>
          Player 1: {playerOne}
          <Canvas penColor='blue' />
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
          <Canvas penColor='red' />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
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
  return page;
}

import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  DrawThePerfectShapeDifficulty,
  DrawThePerfectShapeGameState,
  DrawThePerfectShapePixel,
  DrawThePerfectShapeShape,
  DrawThePerfectShapeTitle,
  GameArea,
  GameResult,
  GameStatus,
} from '../../../types/CoveyTownSocket';
import PlayerController from '../../PlayerController';
import TownController from '../../TownController';
import GameAreaController from './../GameAreaController';
import { NO_GAME_IN_PROGRESS_ERROR } from './../TicTacToeAreaController';
import DrawThePerfectShapeAreaController from './DrawThePerfectShapeAreaController';

describe('[T1] DrawThePerfectShapeAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];
  const exampleShape = {
    title: 'Christmas Tree' as DrawThePerfectShapeTitle,
    difficulty: 'Easy' as DrawThePerfectShapeDifficulty,
    pixels: [] as DrawThePerfectShapePixel[],
    addPixels: () => {
      return;
    },
    accuracy: () => {
      return 0;
    },
  };
  const exampleShape2 = {
    title: 'Circle' as DrawThePerfectShapeTitle,
    difficulty: 'Easy' as DrawThePerfectShapeDifficulty,
    pixels: [] as DrawThePerfectShapePixel[],
    addPixels: () => {
      return;
    },
    accuracy: () => {
      return 0;
    },
  };

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  mockTownController.getPlayer.mockImplementation(playerID => {
    const p = mockTownController.players.find(player => player.id === playerID);
    assert(p);
    return p;
  });

  function drawThePerfectShapeAreaControllerWithProp({
    _id,
    history,
    player1,
    player2,
    trace_shape,
    timer,
    last_time,
    difficulty,
    player1_shape,
    player2_shape,
    accuracy1,
    accuracy2,
    undefinedGame,
    winner,
    status,
  }: {
    _id?: string;
    history?: GameResult[];
    player1?: string;
    player2?: string;
    trace_shape?: DrawThePerfectShapeShape;
    timer: number;
    last_time: number;
    difficulty: DrawThePerfectShapeDifficulty;
    player1_shape?: DrawThePerfectShapeShape;
    player2_shape?: DrawThePerfectShapeShape;
    accuracy1: number;
    accuracy2: number;
    undefinedGame?: boolean;
    winner?: string;
    status: GameStatus;
  }) {
    const id = _id || nanoid();
    const players = [];
    if (player1) players.push(player1);
    if (player2) players.push(player2);
    const ret = new DrawThePerfectShapeAreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        type: 'DrawThePerfectShapeArea',
        game: undefinedGame
          ? undefined
          : {
              id,
              players: players,
              state: {
                player1: player1,
                player2: player2,
                trace_shape: trace_shape,
                timer: timer,
                last_time: last_time,
                difficulty: difficulty,
                player1_shape: player1_shape,
                player2_shape: player2_shape,
                accuracy1: accuracy1,
                accuracy2: accuracy2,
                winner: winner,
                status: status,
              },
            },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
    }
    return ret;
  }
  describe('[T1.1]', () => {
    describe('isActive', () => {
      it('should return true if the game is in progress', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 0,
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(true);
      });
      it('should return false if the game is not in progress', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 0,
          status: 'OVER',
        });
        expect(controller.isActive()).toBe(false);
      });
    });
    describe('PlayerOne', () => {
      it('should return player1 if player1 exists', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 0,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
        });
        expect(controller.playerOne).toBe(ourPlayer);
      });
      it('should return undefined if player1 does not exist', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 0,
          status: 'IN_PROGRESS',
        });
        expect(controller.playerOne).toBe(undefined);
      });
      it('should return undefined if only player2 exists', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 0,
          status: 'IN_PROGRESS',
          player2: ourPlayer.id,
        });
        expect(controller.playerOne).toBe(undefined);
      });
    });
    describe('PlayerTwo', () => {
      it('should return player2 if player2 exists', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 0,
          status: 'IN_PROGRESS',
          player2: ourPlayer.id,
        });
        expect(controller.playerTwo).toBe(ourPlayer);
      });
      it('should return undefined if player2 does not exist', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 0,
          status: 'IN_PROGRESS',
        });
        expect(controller.playerTwo).toBe(undefined);
      });
      it('should return undefined if only player1 exists', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 0,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
        });
        expect(controller.playerTwo).toBe(undefined);
      });
    });
    describe('playerOneAccuracy', () => {
      it('should return the correct accuracy of player one', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'OVER',
          player1: ourPlayer.id,
        });
        expect(controller.playerOneAccuracy).toBe(0);
      });
      it('should throw an error if the game is still in progress', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
        });
        expect(controller.playerOneAccuracy).toBe(0);
      });
    });
    describe('playerTwoAccuracy', () => {
      it('should return the correct accuracy of player two', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'OVER',
          player1: ourPlayer.id,
        });
        expect(controller.playerTwoAccuracy).toBe(0);
      });
      it('should throw an error if the game is still in progress', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
        });
        expect(controller.playerTwoAccuracy).toBe(0);
      });
    });
    describe('status', () => {
      it('should return the status of the game', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
        });
        expect(controller.status).toBe('IN_PROGRESS');
      });
      it('should return WAITING_TO_START if the game is not defined', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          undefinedGame: true,
        });
        expect(controller.status).toBe('WAITING_TO_START');
      });
    });
    describe('difficulty', () => {
      it('should return the difficulty of the game', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Hard',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
        });
        expect(controller.difficulty).toBe('Hard');
      });
      it('should return Easy if the game is not defined', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          undefinedGame: true,
        });
        expect(controller.difficulty).toBe('Easy');
      });
    });
    describe('traceShape', () => {
      it('should return the tracing shape of the game instance', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Hard',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          trace_shape: exampleShape,
        });
        expect(controller.traceShape).toBe(exampleShape);
      });
      it('should return undefined if the game is not defined', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          undefinedGame: true,
        });
        expect(controller.traceShape).toBe(undefined);
      });
    });
    describe('playerOneShape', () => {
      it('should return player ones shape', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Hard',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player1_shape: exampleShape,
          player2_shape: exampleShape2,
        });
        expect(controller.playerOneShape).toBe(exampleShape);
      });
      it('should return undefined if the game is not defined', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          undefinedGame: true,
        });
        expect(controller.playerOneShape).toBe(undefined);
      });
    });
    describe('playerTwoShape', () => {
      it('should return player twos shape', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Hard',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player1_shape: exampleShape,
          player2_shape: exampleShape2,
        });
        expect(controller.playerTwoShape).toBe(exampleShape2);
      });
      it('should return undefined if the game is not defined', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          undefinedGame: true,
        });
        expect(controller.playerTwoShape).toBe(undefined);
      });
    });
    describe('Timer', () => {
      it('should return the value of the timer', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 15,
          last_time: 10,
          difficulty: 'Hard',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
        });
        expect(controller.timer).toBe(15);
      });
      it('should return 10 if the game is not defined', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          undefinedGame: true,
        });
        expect(controller.timer).toBe(20);
      });
    });
    describe('winner', () => {
      it('should return the winner if there is one', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          winner: ourPlayer.id,
        });
        expect(controller.winner).toBe(ourPlayer);
      });
      it('should return undefined if there is no winner', () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'IN_PROGRESS',
        });
        expect(controller.winner).toBe(undefined);
      });
    });
    describe('makeMove', () => {
      it('should throw an error if the game is not in progress', async () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'OVER',
          player1: ourPlayer.id,
        });
        await expect(async () => controller.makeMove(1, [])).rejects.toEqual(
          new Error(NO_GAME_IN_PROGRESS_ERROR),
        );
      });
      it('Should call townController.sendInteractableCommand', async () => {
        const controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'GAME_STARTED',
          player1: ourPlayer.id,
        });
        // Simulate joining the game for real
        const instanceID = nanoid();
        mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
          return { gameID: instanceID };
        });
        await controller.joinGame();
        mockTownController.sendInteractableCommand.mockReset();
        await controller.makeMove(2, []);
        expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
          type: 'GameMove',
          gameID: instanceID,
          move: {
            player: 2,
            pixels: [],
          },
        });
      });
    });
  });
  describe('[T1.2] _updateFrom', () => {
    describe('if the game is in progress', () => {
      let controller: DrawThePerfectShapeAreaController;
      beforeEach(() => {
        controller = drawThePerfectShapeAreaControllerWithProp({
          timer: 10,
          last_time: 10,
          difficulty: 'Easy',
          accuracy1: 0,
          accuracy2: 32,
          status: 'OVER',
          player1: ourPlayer.id,
          player1_shape: exampleShape,
          player2_shape: exampleShape2,
        });
      });
      it('should emit a timerChanged event with the new timer value', () => {
        const model = controller.toInteractableAreaModel();
        const newTimer = 5;
        assert(model.game);
        const newModel: GameArea<DrawThePerfectShapeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              timer: newTimer,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const timerChangedCall = emitSpy.mock.calls.find(call => call[0] === 'timerChanged');
        expect(timerChangedCall).toBeDefined();
        if (timerChangedCall) expect(timerChangedCall[1]).toEqual(5);
      });
      it('should update the timer in the controller with the new timer value', () => {
        const model = controller.toInteractableAreaModel();
        const newTimer = 5;
        assert(model.game);
        const newModel: GameArea<DrawThePerfectShapeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              timer: newTimer,
            },
          },
        };
        expect(controller.timer).toEqual(10);
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const timerChangedCall = emitSpy.mock.calls.find(call => call[0] === 'timerChanged');
        expect(timerChangedCall).toBeDefined();
        if (timerChangedCall) expect(controller.timer).toEqual(5);
      });
      it('should emit a difficultyChanged with the new difficulty, a traceShapePixels, and a traceShapeTitle event to be called when the difficulty is changed', () => {
        const model = controller.toInteractableAreaModel();
        const newDifficulty = 'Hard';
        assert(model.game);
        const newModel: GameArea<DrawThePerfectShapeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              difficulty: newDifficulty,
              trace_shape: exampleShape,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const difficultyChangedCall = emitSpy.mock.calls.find(
          call => call[0] === 'difficultyChanged',
        );
        expect(difficultyChangedCall).toBeDefined();
        if (difficultyChangedCall) expect(difficultyChangedCall[1]).toEqual('Hard');
        const traceShapePixelsCall = emitSpy.mock.calls.find(
          call => call[0] === 'traceShapeChanged',
        );
        expect(traceShapePixelsCall).toBeDefined();
      });
      it('should update the difficulty in the controller with the new difficulty value', () => {
        const model = controller.toInteractableAreaModel();
        const newDifficulty = 'Hard';
        assert(model.game);
        const newModel: GameArea<DrawThePerfectShapeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              difficulty: newDifficulty,
              trace_shape: exampleShape,
            },
          },
        };
        expect(controller.difficulty).toEqual('Easy');
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const difficultyChangedCall = emitSpy.mock.calls.find(
          call => call[0] === 'difficultyChanged',
        );
        const traceShapePixelsCall = emitSpy.mock.calls.find(
          call => call[0] === 'traceShapeChanged',
        );
        expect(difficultyChangedCall).toBeDefined();
        expect(traceShapePixelsCall).toBeDefined();
        if (difficultyChangedCall) expect(difficultyChangedCall[1]).toEqual('Hard');
      });
      it('should not emit difficultyChanged if the trace_shape is undefined', () => {
        const model = controller.toInteractableAreaModel();
        const newDifficulty = 'Hard';
        assert(model.game);
        const newModel: GameArea<DrawThePerfectShapeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              difficulty: newDifficulty,
            },
          },
        };
        expect(controller.difficulty).toEqual('Easy');
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const difficultyChangedCall = emitSpy.mock.calls.find(
          call => call[0] === 'difficultyChanged',
        );
        const traceShapePixelsCall = emitSpy.mock.calls.find(
          call => call[0] === 'traceShapePixels',
        );
        const traceShapeTitleCall = emitSpy.mock.calls.find(call => call[0] === 'traceShapeTitle');
        expect(difficultyChangedCall).toBeUndefined();
        expect(traceShapePixelsCall).toBeUndefined();
        expect(traceShapeTitleCall).toBeUndefined();
        if (difficultyChangedCall) expect(difficultyChangedCall[1]).toEqual('Hard');
      });
      it('should emit a playerOnePixelChanged event with the new pixels', () => {
        const model = controller.toInteractableAreaModel();
        const newShape = {
          title: 'Christmas Tree' as DrawThePerfectShapeTitle,
          difficulty: 'Easy' as DrawThePerfectShapeDifficulty,
          pixels: [{ x: 3, y: 2 }] as DrawThePerfectShapePixel[],
          addPixels: () => {
            return;
          },
          accuracy: () => {
            return 0;
          },
        };
        assert(model.game);
        const newModel: GameArea<DrawThePerfectShapeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              player1_shape: newShape,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const playerOnePixelChangedCall = emitSpy.mock.calls.find(
          call => call[0] === 'playerOnePixelChanged',
        );
        expect(playerOnePixelChangedCall).toBeDefined();
        if (playerOnePixelChangedCall)
          expect(playerOnePixelChangedCall[1]).toEqual([{ x: 3, y: 2 }]);
      });
      it('should emit a playerTwoPixelChanged event with the new pixels', () => {
        const model = controller.toInteractableAreaModel();
        const newShape = {
          title: 'Christmas Tree' as DrawThePerfectShapeTitle,
          difficulty: 'Easy' as DrawThePerfectShapeDifficulty,
          pixels: [{ x: 3, y: 2 }] as DrawThePerfectShapePixel[],
          addPixels: () => {
            return;
          },
          accuracy: () => {
            return 0;
          },
        };
        assert(model.game);
        const newModel: GameArea<DrawThePerfectShapeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              player2_shape: newShape,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const playerTwoPixelChangedCall = emitSpy.mock.calls.find(
          call => call[0] === 'playerTwoPixelChanged',
        );
        expect(playerTwoPixelChangedCall).toBeDefined();
        if (playerTwoPixelChangedCall)
          expect(playerTwoPixelChangedCall[1]).toEqual([{ x: 3, y: 2 }]);
      });
      it('should update the shape returned from the controller for playerTwo', () => {
        const model = controller.toInteractableAreaModel();
        const newShape = {
          title: 'Christmas Tree' as DrawThePerfectShapeTitle,
          difficulty: 'Easy' as DrawThePerfectShapeDifficulty,
          pixels: [{ x: 3, y: 2 }] as DrawThePerfectShapePixel[],
          addPixels: () => {
            return;
          },
          accuracy: () => {
            return 0;
          },
        };
        assert(model.game);
        const newModel: GameArea<DrawThePerfectShapeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              player2_shape: newShape,
            },
          },
        };
        expect(controller.playerTwoShape).toEqual(exampleShape2);
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const playerTwoPixelChangedCall = emitSpy.mock.calls.find(
          call => call[0] === 'playerTwoPixelChanged',
        );
        expect(playerTwoPixelChangedCall).toBeDefined();
        expect(controller.playerTwoShape).toEqual(newShape);
      });
      it('should update the shape returned from the controller for playerOne', () => {
        const model = controller.toInteractableAreaModel();
        const newShape = {
          title: 'Christmas Tree' as DrawThePerfectShapeTitle,
          difficulty: 'Easy' as DrawThePerfectShapeDifficulty,
          pixels: [{ x: 3, y: 2 }] as DrawThePerfectShapePixel[],
          addPixels: () => {
            return;
          },
          accuracy: () => {
            return 0;
          },
        };
        assert(model.game);
        const newModel: GameArea<DrawThePerfectShapeGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
              player1_shape: newShape,
            },
          },
        };
        expect(controller.playerOneShape).toEqual(exampleShape);
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const playerOnePixelChangedCall = emitSpy.mock.calls.find(
          call => call[0] === 'playerOnePixelChanged',
        );
        expect(playerOnePixelChangedCall).toBeDefined();
        expect(controller.playerOneShape).toEqual(newShape);
      });
      it('should call super._updateFrom', () => {
        //eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore - we are testing spying on a private method
        const spy = jest.spyOn(GameAreaController.prototype, '_updateFrom');
        const model = controller.toInteractableAreaModel();
        controller.updateFrom(model, otherPlayers.concat(ourPlayer));
        expect(spy).toHaveBeenCalled();
      });
    });
  });
  describe('[T1.2] pickDifficulty', () => {
    it('should throw an error if the game is not in progress', async () => {
      const controller = drawThePerfectShapeAreaControllerWithProp({
        timer: 10,
        last_time: 10,
        difficulty: 'Easy',
        accuracy1: 0,
        accuracy2: 32,
        status: 'OVER',
        player1: ourPlayer.id,
      });
      await expect(async () => controller.pickDifficulty('Hard')).rejects.toEqual(
        new Error(NO_GAME_IN_PROGRESS_ERROR),
      );
    });
    it('Should call townController.sendInteractableCommand', async () => {
      const controller = drawThePerfectShapeAreaControllerWithProp({
        timer: 10,
        last_time: 10,
        difficulty: 'Easy',
        accuracy1: 0,
        accuracy2: 32,
        status: 'GAME_STARTED',
        player1: ourPlayer.id,
      });
      // Simulate joining the game for real
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();
      mockTownController.sendInteractableCommand.mockReset();
      await controller.makeMove(2, []);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        type: 'GameMove',
        gameID: instanceID,
        move: {
          player: 2,
          pixels: [],
        },
      });
    });
  });
});

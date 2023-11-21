import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { createPlayerForTesting } from '../../../TestUtils';
import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../../lib/InvalidParametersError';
import Player from '../../../lib/Player';
import {
  DrawThePerfectShapeGameState,
  DrawThePerfectShapeMove,
  GameInstanceID,
  TownEmitter,
} from '../../../types/CoveyTownSocket';
import * as DrawThePerfectShapeGameModule from './DrawThePerfectShapeGame';
import Game from '../Game';
import DrawThePerfectShapeGameArea from './DrawThePerfectShapeGameArea';

class TestingGame extends Game<DrawThePerfectShapeGameState, DrawThePerfectShapeMove> {
  public constructor() {
    super({
      timer: 10,
      last_time: 10,
      difficulty: 'Easy',
      accuracy1: 0,
      accuracy2: 0,
      status: 'IN_PROGRESS',
    });
  }

  public applyMove(): void {}

  public endGame(winner?: string) {
    this.state = {
      ...this.state,
      status: 'OVER',
      winner,
    };
  }

  protected _join(player: Player): void {
    if (this.state.player1) {
      this.state.player2 = player.id;
    } else {
      this.state.player1 = player.id;
    }
    this._players.push(player);
  }

  protected _leave(): void {}
}
describe('DrawThePerfectShapeGameArea', () => {
  let gameArea: DrawThePerfectShapeGameArea;
  let player1: Player;
  let player2: Player;
  let interactableUpdateSpy: jest.SpyInstance;
  let game: TestingGame;
  beforeEach(() => {
    const gameConstructorSpy = jest.spyOn(DrawThePerfectShapeGameModule, 'default');
    game = new TestingGame();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    gameConstructorSpy.mockReturnValue(game);

    player1 = createPlayerForTesting();
    player2 = createPlayerForTesting();
    gameArea = new DrawThePerfectShapeGameArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );
    gameArea.add(player1);
    gameArea.add(player2);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });
  describe('handleCommand', () => {
    describe('[T3.1] when given a JoinGame command', () => {
      describe('when there is no game in progress', () => {
        it('should create a new game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          expect(gameID).toBeDefined();
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(gameID).toEqual(game.id);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
      });
      describe('when there is a game in progress', () => {
        it('should dispatch the join command to the game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

          const joinSpy = jest.spyOn(game, 'join');
          const gameID2 = gameArea.handleCommand({ type: 'JoinGame' }, player2).gameID;
          expect(joinSpy).toHaveBeenCalledWith(player2);
          expect(gameID).toEqual(gameID2);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();

          const joinSpy = jest.spyOn(game, 'join').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() => gameArea.handleCommand({ type: 'JoinGame' }, player2)).toThrowError(
            'Test Error',
          );
          expect(joinSpy).toHaveBeenCalledWith(player2);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
    });
    describe('[T3.2] when given a GameMove command', () => {
      it('should throw an error when there is no game in progress', () => {
        expect(() =>
          gameArea.handleCommand(
            { type: 'GameMove', move: { player: 1, pixels: [] }, gameID: nanoid() },
            player1,
          ),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      describe('when there is a game in progress', () => {
        let gameID: GameInstanceID;
        beforeEach(() => {
          gameID = gameArea.handleCommand({ type: 'JoinGame' }, player1).gameID;
          gameArea.handleCommand({ type: 'JoinGame' }, player2);
          interactableUpdateSpy.mockClear();
        });
        it('should throw an error when the game ID does not match', () => {
          expect(() =>
            gameArea.handleCommand(
              { type: 'GameMove', move: { player: 1, pixels: [] }, gameID: nanoid() },
              player1,
            ),
          ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
        });
        it('should dispatch the move to the game and call _emitAreaChanged', () => {
          const move: DrawThePerfectShapeMove = { player: 1, pixels: [] };
          const applyMoveSpy = jest.spyOn(game, 'applyMove');
          gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
          expect(applyMoveSpy).toHaveBeenCalledWith({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          const move: DrawThePerfectShapeMove = { player: 1, pixels: [] };
          const applyMoveSpy = jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() =>
            gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1),
          ).toThrowError('Test Error');
          expect(applyMoveSpy).toHaveBeenCalledWith({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        describe('when the game is over, it records a new row in the history and calls _emitAreaChanged', () => {
          test('when player1 wins', () => {
            const move: DrawThePerfectShapeMove = { player: 1, pixels: [] };
            jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
              game.endGame(player1.id);
            });
            gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
            expect(game.state.status).toEqual('OVER');
            expect(gameArea.history.length).toEqual(1);
            expect(gameArea.history[0]).toEqual({
              gameID: game.id,
              scores: {
                [player1.userName]: 1,
                [player2.userName]: 0,
              },
            });
            expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          });
          test('when player2 wins', () => {
            const move: DrawThePerfectShapeMove = { player: 1, pixels: [] };
            jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
              game.endGame(player2.id);
            });
            gameArea.handleCommand({ type: 'GameMove', move, gameID }, player2);
            expect(game.state.status).toEqual('OVER');
            expect(gameArea.history.length).toEqual(1);
            expect(gameArea.history[0]).toEqual({
              gameID: game.id,
              scores: {
                [player1.userName]: 0,
                [player2.userName]: 1,
              },
            });
            expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          });
          test('when there is a tie', () => {
            const move: DrawThePerfectShapeMove = { player: 1, pixels: [] };
            jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
              game.endGame();
            });
            gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
            expect(game.state.status).toEqual('OVER');
            expect(gameArea.history.length).toEqual(1);
            expect(gameArea.history[0]).toEqual({
              gameID: game.id,
              scores: {
                [player1.userName]: 0,
                [player2.userName]: 0,
              },
            });
            expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
    describe('[T3.3] when given a LeaveGame command', () => {
      describe('when there is no game in progress', () => {
        it('should throw an error', () => {
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
      describe('when there is a game in progress', () => {
        it('should throw an error when the game ID does not match', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          interactableUpdateSpy.mockClear();
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        it('should dispatch the leave command to the game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          const leaveSpy = jest.spyOn(game, 'leave');
          gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
          expect(leaveSpy).toHaveBeenCalledWith(player1);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();
          const leaveSpy = jest.spyOn(game, 'leave').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() =>
            gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, player1),
          ).toThrowError('Test Error');
          expect(leaveSpy).toHaveBeenCalledWith(player1);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        it('should update the history if the game is over', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          gameArea.handleCommand({ type: 'JoinGame' }, player2);
          interactableUpdateSpy.mockClear();
          jest.spyOn(game, 'leave').mockImplementationOnce(() => {
            game.endGame(player1.id);
          });
          gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
          expect(game.state.status).toEqual('OVER');
          expect(gameArea.history.length).toEqual(1);
          expect(gameArea.history[0]).toEqual({
            gameID: game.id,
            scores: {
              [player1.userName]: 1,
              [player2.userName]: 0,
            },
          });
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
      });
    });
    describe('[T3.4] when given an invalid command', () => {
      it('should throw an error', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore (Testing an invalid command, only possible at the boundary of the type system)
        expect(() => gameArea.handleCommand({ type: 'InvalidCommand' }, player1)).toThrowError(
          INVALID_COMMAND_MESSAGE,
        );
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
    describe('[T3.3] when given a StartGame command', () => {
      describe('when there is no game in progress', () => {
        it('should throw an error', () => {
          expect(() =>
            gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
      describe('when there is a game in progress', () => {
        it('should throw an error when the game ID does not match', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          interactableUpdateSpy.mockClear();
          expect(() =>
            gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, player1),
          ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        it('should update last_time and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          const oldLastTime = game.state.last_time;
          gameArea.handleCommand({ type: 'StartGame', gameID }, player1);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
          expect(game.state.last_time !== oldLastTime);
        });
      });
    });
    describe('[T3.3] when given a PickDifficulty command', () => {
      describe('when there is no game in progress', () => {
        it('should throw an error', () => {
          expect(() =>
            gameArea.handleCommand(
              { type: 'PickDifficulty', gameID: nanoid(), gameDifficulty: 'Hard' },
              player1,
            ),
          ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
      describe('when there is a game in progress', () => {
        it('for Easy: should update timer, player1 shape, player2 shape, and trace shape and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          expect(game.state.timer).toEqual(10);
          expect(game.state.difficulty).toEqual('Easy');
          const oldTraceShape = game.state.trace_shape;
          const oldPlayer1Shape = game.state.player1_shape;
          const oldPlayer2Shape = game.state.player2_shape;
          gameArea.handleCommand(
            { type: 'PickDifficulty', gameID, gameDifficulty: 'Easy' },
            player1,
          );
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
          expect(game.state.timer).toEqual(10);
          expect(game.state.difficulty).toEqual('Easy');
          expect(game.state.trace_shape !== oldTraceShape);
          expect(game.state.player1_shape !== oldPlayer1Shape);
          expect(game.state.player2_shape !== oldPlayer2Shape);
        });
        it('for Medium: should update timer, player1 shape, player2 shape, and trace shape and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          expect(game.state.timer).toEqual(10);
          expect(game.state.difficulty).toEqual('Easy');
          const oldTraceShape = game.state.trace_shape;
          const oldPlayer1Shape = game.state.player1_shape;
          const oldPlayer2Shape = game.state.player2_shape;
          gameArea.handleCommand(
            { type: 'PickDifficulty', gameID, gameDifficulty: 'Medium' },
            player1,
          );
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
          expect(game.state.timer).toEqual(15);
          expect(game.state.difficulty).toEqual('Medium');
          expect(game.state.trace_shape !== oldTraceShape);
          expect(game.state.player1_shape !== oldPlayer1Shape);
          expect(game.state.player2_shape !== oldPlayer2Shape);
        });
        it('for Hard: should update timer, player1 shape, player2 shape, and trace shape and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          expect(game.state.timer).toEqual(10);
          expect(game.state.difficulty).toEqual('Easy');
          const oldTraceShape = game.state.trace_shape;
          const oldPlayer1Shape = game.state.player1_shape;
          const oldPlayer2Shape = game.state.player2_shape;
          gameArea.handleCommand(
            { type: 'PickDifficulty', gameID, gameDifficulty: 'Hard' },
            player1,
          );
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
          expect(game.state.timer).toEqual(20);
          expect(game.state.difficulty).toEqual('Hard');
          expect(game.state.trace_shape !== oldTraceShape);
          expect(game.state.player1_shape !== oldPlayer1Shape);
          expect(game.state.player2_shape !== oldPlayer2Shape);
        });
      });
    });
  });
});

import exp from 'constants';
import { createPlayerForTesting } from '../../../TestUtils';
import {
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  SHAPE_DOES_NOT_EXISTS,
} from '../../../lib/InvalidParametersError';
import DrawThePerfectShapeGame from './DrawThePerfectShapeGame';
import {
  DrawThePerfectShapeMove,
  DrawThePerfectShapePixel,
  DrawThePerfectShapeShape,
} from '../../../types/CoveyTownSocket';

describe('DrawThePerfectShapeGame', () => {
  let game: DrawThePerfectShapeGame;

  beforeEach(() => {
    game = new DrawThePerfectShapeGame();
  });

  describe('_join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      const player2 = createPlayerForTesting();
      game.join(player2);
      expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    describe('When the player joins', () => {
      it('makes the first player as player1 and initializes the state with WAITING_TO_START', () => {
        const player = createPlayerForTesting();
        game.join(player);
        expect(game.state.player1).toEqual(player.id);
        expect(game.state.player2).toBeUndefined();
        expect(game.state.winner).toBeUndefined();
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.accuracy1).toEqual(0);
        expect(game.state.accuracy2).toEqual(0);
      });

      describe('when the second player joins', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        beforeEach(() => {
          game.join(player1);
          game.join(player2);
        });
        it('makes the second player as player2', () => {
          expect(game.state.player1).toEqual(player1.id);
          expect(game.state.player2).toEqual(player2.id);
        });
        it('sets the game status to IN_PROGRESS', () => {
          expect(game.state.status).toEqual('IN_PROGRESS');
          expect(game.state.winner).toBeUndefined();
        });
        it('sets all the game settings to the default value', () => {
          expect(game.state.difficulty).toEqual('Easy');
          expect(game.state.timer).toEqual(10);
          expect(game.state.last_time).toEqual(0);
          expect(game.state.player1_shape).toBeUndefined();
          expect(game.state.player2_shape).toBeUndefined();
          expect(game.state.trace_shape).toBeUndefined();
        });
      });
    });
  });
  describe('_leave', () => {
    it('should throw an error if the player is not in the game', () => {
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });

    describe('when the player is in the game', () => {
      describe('when the game is in progress, it should set the game status to OVER and declare the other player the winner', () => {
        test('when player1 leaves', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.player1).toEqual(player1.id);
          expect(game.state.player2).toEqual(player2.id);

          game.leave(player1);

          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player2.id);
          expect(game.state.accuracy1).toEqual(0);
          expect(game.state.accuracy2).toEqual(0);
          expect(game.state.trace_shape).toBeUndefined();
          expect(game.state.player1_shape).toBeUndefined();
          expect(game.state.player2_shape).toBeUndefined();
          expect(game.state.last_time).toEqual(0);
          expect(game.state.difficulty).toEqual('Easy');
          expect(game.state.timer).toEqual(10);

          expect(game.state.player1).toEqual(player1.id);
          expect(game.state.player2).toEqual(player2.id);
        });
        test('when player2 leaves', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.player1).toEqual(player1.id);
          expect(game.state.player2).toEqual(player2.id);

          game.leave(player2);

          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player1.id);
          expect(game.state.accuracy1).toEqual(0);
          expect(game.state.accuracy2).toEqual(0);
          expect(game.state.trace_shape).toBeUndefined();
          expect(game.state.player1_shape).toBeUndefined();
          expect(game.state.player2_shape).toBeUndefined();
          expect(game.state.last_time).toEqual(0);
          expect(game.state.difficulty).toEqual('Easy');
          expect(game.state.timer).toEqual(10);

          expect(game.state.player1).toEqual(player1.id);
          expect(game.state.player2).toEqual(player2.id);
        });
      });
      it('when the game is not in progress, it should set the game to WAITING_TO_START and remove the player', () => {
        const player1 = createPlayerForTesting();
        game.join(player1);
        expect(game.state.player1).toEqual(player1.id);
        expect(game.state.player2).toBeUndefined();
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
        game.leave(player1);
        expect(game.state.player1).toBeUndefined();
        expect(game.state.player2).toBeUndefined();
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
    });
  });
  describe('applyMove', () => {
    it('if the shape of player1 does not exist, throw a SHAPE_DOES_NOT_EXIST error', () => {
      const player1 = createPlayerForTesting();
      const shapeMove: DrawThePerfectShapeMove = {
        player: 1,
        pixels: [{ x: 10, y: 25 }],
      };
      game.join(player1);
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: shapeMove,
        }),
      ).toThrowError(SHAPE_DOES_NOT_EXISTS);
    });
    it('if the shape of player2 does not exist, throw a SHAPE_DOES_NOT_EXIST error', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const shapeMove: DrawThePerfectShapeMove = {
        player: 2,
        pixels: [{ x: 10, y: 25 }],
      };
      game.join(player1);
      game.join(player2);
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player2.id,
          move: shapeMove,
        }),
      ).toThrowError(SHAPE_DOES_NOT_EXISTS);
    });
    it('if the timer is less than 0, game status should be not be IN_PROGRESS', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const shapeMove: DrawThePerfectShapeMove = {
        player: 2,
        pixels: [{ x: 10, y: 25 }],
      };
      const exampleShape: DrawThePerfectShapeShape = {
        title: 'Circle',
        difficulty: 'Medium',
        pixels: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
        addPixels(newPixels: DrawThePerfectShapePixel[]) {
          this.pixels.push(...newPixels);
        },
        accuracy(otherShape: DrawThePerfectShapeShape) {
          return 0.75;
        },
      };
      game.join(player1);
      game.join(player2);
      game.state.player1_shape = exampleShape;
      game.state.player2_shape = exampleShape;
      game.state.trace_shape = exampleShape;
      expect(game.state.player1_shape).toBeDefined();
      expect(game.state.player2_shape).toBeDefined();
      expect(game.state.trace_shape).toBeDefined();
      game.state.last_time = Date.now() / 1000 + 1;
      game.state.timer = -10000;
      expect(game.state.timer).toEqual(-10000);
      expect(game.state.timer < 0).toBeTruthy();
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: shapeMove,
      });
      expect(game.state.status).toEqual('OVER');
    });
    it('if a player has a better accuracy than the other player, they are the winner', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const shapeMove2: DrawThePerfectShapeMove = {
        player: 2,
        pixels: [{ x: 10, y: 25 }],
      };
      const exampleShape: DrawThePerfectShapeShape = {
        title: 'Circle',
        difficulty: 'Medium',
        pixels: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
        addPixels(newPixels: DrawThePerfectShapePixel[]) {
          this.pixels.push(...newPixels);
        },
        accuracy(otherShape: DrawThePerfectShapeShape) {
          return 0.75;
        },
      };
      game.join(player1);
      game.join(player2);
      game.state.player1_shape = exampleShape;
      game.state.player2_shape = exampleShape;
      game.state.trace_shape = exampleShape;
      expect(game.state.player1_shape).toBeDefined();
      expect(game.state.player2_shape).toBeDefined();
      expect(game.state.trace_shape).toBeDefined();
      game.state.last_time = Date.now() / 1000 + 1;
      game.state.timer = -10000;
      expect(game.state.timer).toEqual(-10000);
      expect(game.state.timer < 0).toBeTruthy();
      game.applyMove({
        gameID: game.id,
        playerID: player2.id,
        move: shapeMove2,
      });
      expect(game.state.winner).toEqual(player2.id);
    });
  });
});
// npm test DrawThePerfectShapeGame.test

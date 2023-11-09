import Game from './Game';
import Player from '../../lib/Player';
import {
  DrawThePerfectShapeGameState,
  DrawThePerfectShapeMove,
  GameMove,
} from '../../types/CoveyTownSocket';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';

export default class DrawThePerfectShapeGame extends Game<
  DrawThePerfectShapeGameState,
  DrawThePerfectShapeMove
> {
  public constructor() {
    super({
      status: 'WAITING_TO_START',
    });
  }

  public applyMove(move: GameMove<DrawThePerfectShapeMove>): void {
    throw new Error('Method not implemented.');
  }

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the new player.
   * Assigns the first player that joins to be player 1 and the second player to be player 2
   * If the game is now full (has two players), updates the game's state to set the status to IN_PROGRESS.
   *
   * @param player The player to join the game
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   *  or the game is full (GAME_FULL_MESSAGE)
   */
  protected _join(player: Player): void {
    if (this.state.player1 === player.id || this.state.player2 === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (!this.state.player1) {
      this.state = {
        ...this.state,
        player1: player.id,
      };
    } else if (!this.state.player2) {
      this.state = {
        ...this.state,
        player2: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    if (this.state.player1 && this.state.player2) {
      this.state = {
        ...this.state
      };
    }
  }

   /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   * If the game has two players in it at the time of call to this method,
   *   updates the game's status to OVER and sets the winner to the other player.
   * If the game does not yet have two players in it at the time of call to this method,
   *   updates the game's status to WAITING_TO_START.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    if (this.state.player1 !== player.id && this.state.player2 !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    // Handles case where the game has not started yet
    if (this.state.player2 === undefined) {
      this.state = {
        trace_shape: undefined,
        player1_shape: undefined,
        player2_shape: undefined,
        status: 'WAITING_TO_START',
      };
      return;
    }
    if (this.state.player1 === player.id) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.player2,
      };
    } else {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.player1,
      };
    }
  }
}

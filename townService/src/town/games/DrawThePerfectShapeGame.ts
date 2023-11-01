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
        ...this.state,
        status: 'IN_PROGRESS',
      };
    }
  }

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

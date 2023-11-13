import _ from 'lodash';
import {
  GameArea,
  GameStatus,
  DrawThePerfectShapeGameState,
  DrawThePerfectShapePixel,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';

export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

// export type TicTacToeCell = 'X' | 'O' | undefined;
// export type TicTacToeEvents = GameEventTypes & {
//   boardChanged: (board: TicTacToeCell[][]) => void;
//   turnChanged: (isOurTurn: boolean) => void;
// };

export type DrawThePerfectShapeEvents = GameEventTypes & {

}

/**
 * This class is responsible for managing the state of the Tic Tac Toe game, and for sending commands to the server
 */
export default class DrawThePerfectShapeAreaController extends GameAreaController<
  DrawThePerfectShapeGameState,
  DrawThePerfectShapeEvents
> {
  /**
   * 
   */
  get player1(): PlayerController | undefined {
    const x = this._model.game?.state.player1;
    if (x) {
      return this.occupants.find(eachOccupant => eachOccupant.id === x);
    }
    return undefined;
  }

  /**
   * 
   */
  get player2(): PlayerController | undefined {
    const o = this._model.game?.state.player2;
    if (o) {
      return this.occupants.find(eachOccupant => eachOccupant.id === o);
    }
    return undefined;
  }

  /**
   * Returns the winner of the game, if there is one
   */
  get winner(): PlayerController | undefined {
    const winner = this._model.game?.state.winner;
    if (winner) {
      return this.occupants.find(eachOccupant => eachOccupant.id === winner);
    }
    return undefined;
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    if (this._townController.ourPlayer?.id) {
        return this._model.game?.players.includes(this._townController.ourPlayer?.id) || false;
    }
    return false;
  }


  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_TO_START';
    }
    return status;
  }

  /**
   * Returns true if the game is in progress
   */
  public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }

  /**
   * 
   */
  protected _updateFrom(newModel: GameArea<DrawThePerfectShapeGameState>): void {
  }

  /**
   * 
   */
  public async makeMove(pixels: DrawThePerfectShapePixel[]) {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }
    await this._townController.sendInteractableCommand(this.id, {
      type: 'GameMove',
      gameID: instanceID,
      move: {
        player: this., // I don't know what to do for player 
        pixels,
      },
    });
  }
}

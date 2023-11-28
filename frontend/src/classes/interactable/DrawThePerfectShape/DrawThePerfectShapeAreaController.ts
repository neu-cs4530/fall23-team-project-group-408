import _ from 'lodash';
import {
  DrawThePerfectShapeDifficulty,
  DrawThePerfectShapeGameState,
  DrawThePerfectShapePlayer,
  DrawThePerfectShapeShape,
  DrawThePerfectShapePixel,
  DrawThePerfectShapeTitle,
  GameArea,
  GameStatus,
} from '../../../types/CoveyTownSocket';
import PlayerController from '../../PlayerController';
import GameAreaController, { GameEventTypes } from '../GameAreaController';
import { NO_GAME_IN_PROGRESS_ERROR } from '../TicTacToeAreaController';

export type DrawThePerfectShapeEvents = GameEventTypes & {
  difficultyChanged: (difficulty: DrawThePerfectShapeDifficulty) => void;
  traceShapePixels: (traceShapePixels: DrawThePerfectShapePixel[]) => void;
  traceShapeTitle: (traceShapeTitle: DrawThePerfectShapeTitle) => void;
  timerChanged: (timer: number) => void;
  playerOnePixelChanged: (playerOnePixels: DrawThePerfectShapePixel[]) => void;
  playerTwoPixelChanged: (playerTwoPixels: DrawThePerfectShapePixel[]) => void;
};

export default class DrawThePerfectShapeController extends GameAreaController<
  DrawThePerfectShapeGameState,
  DrawThePerfectShapeEvents
> {
  protected _playerOnePixelCount: integer = 0;

  protected _playerTwoPixelCount: integer = 0;

  protected _timer = 0;

  protected _difficulty: DrawThePerfectShapeDifficulty = 'Easy';

  protected _gameEnded = false;

  /**
   * Returns the Player One, if there is one, or undefined otherwise
   */
  get playerOne(): PlayerController | undefined {
    const playerOne = this._model.game?.state.player1;
    if (playerOne) {
      return this.occupants.find(eachOccupant => eachOccupant.id === playerOne);
    }
    return undefined;
  }

  /**
   * Returns Player Two, if there is one, or undefined otherwise
   */
  get playerTwo(): PlayerController | undefined {
    const playerTwo = this._model.game?.state.player2;
    if (playerTwo) {
      return this.occupants.find(eachOccupant => eachOccupant.id === playerTwo);
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
   * Returns the accuracy of player one, if the game is over, else throws an error
   */
  get playerOneAccuracy(): number {
    if (this._model.game && this._gameEnded) {
      return this._model.game.state.accuracy1;
    }
    return 0;
  }

  /**
   * Returns the accuracy of player two, if the game is over, else throws an error
   */
  get playerTwoAccuracy(): number {
    if (this._model.game && this._gameEnded) {
      return this._model.game.state.accuracy2;
    }
    return 0;
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
   * Returns the difficulty of the game, if the game is undefined returns 'Easy'
   */
  get difficulty(): DrawThePerfectShapeDifficulty {
    if (this._model.game) {
      return this._model.game?.state.difficulty;
    }
    return 'Easy';
  }

  /**
   * Returns the trace shape if the game in not undefined, else return undefined
   */
  get traceShape(): DrawThePerfectShapeShape | undefined {
    if (this._model.game) {
      return this._model.game.state.trace_shape;
    }
    return undefined;
  }

  /**
   * Returns the shape of player one if the game is not undefined, else return undefined
   */
  get playerOneShape(): DrawThePerfectShapeShape | undefined {
    if (this._model.game) {
      return this._model.game.state.player1_shape;
    }
    return undefined;
  }

  /*
   * Returns the shape of player two if the game is not undefined, else return undefined
   */
  get playerTwoShape(): DrawThePerfectShapeShape | undefined {
    if (this._model.game) {
      return this._model.game.state.player2_shape;
    }
    return undefined;
  }

  /*
   * Returns the time if the game is not undefined, else return 10
   */
  get timer(): number {
    if (this._model.game) {
      return this._model.game.state.timer;
    }
    return 20;
  }

  /**
   * Returns true if the current player is player one
   */
  get isPlayerOne(): boolean {
    return this._model.game?.state.player1 === this._townController.ourPlayer.id || false;
  }

  /**
   * Returns true if the current player is player two
   */
  get isPlayerTwo(): boolean {
    return this._model.game?.state.player2 === this._townController.ourPlayer.id || false;
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
  }

  /**
   * Checks if the game has two players
   * @returns if there are two players currently in the game
   */
  public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }

  /**
   * Updates the internal state of this DrawThePerfectShapeController to match the new model.
   *
   * Calls super._updateFrom, which updates the occupants and common properties of this game.
   *
   * If a player's pixels has changed, emits a 'playerOnePixelChanged' or 'playerTwoPixelChanged'
   * event with the new pixels.
   *
   * If the timer has changed, emits a 'timerChanged' event with the new timer.
   * If the difficult has changedm emits a 'difficultyChanged' event with the new difficulty.
   */
  protected _updateFrom(newModel: GameArea<DrawThePerfectShapeGameState>): void {
    super._updateFrom(newModel);
    const newState = newModel.game;
    if (newState) {
      const newTimer = newState.state.timer;
      if (newState.state.trace_shape) {
        const newDifficulty = newState.state.difficulty;

        if (!_.isEqual(this._difficulty, newDifficulty)) {
          this._difficulty = newDifficulty;
          this.emit('difficultyChanged', this._difficulty);
          this.emit('traceShapeChanged', newState.state.trace_shape);
        }
      }
      if (!_.isEqual(this._timer, newTimer)) {
        this._timer = newTimer;
        this.emit('timerChanged', this._timer);
      }
      if (newState.state.player1_shape && newState.state.player2_shape) {
        const newPlayerOneCount = newState.state.player1_shape.pixels.length;
        const newPlayerTwoCount = newState.state.player2_shape.pixels.length;

        if (!_.isEqual(this._playerOnePixelCount, newPlayerOneCount)) {
          this._playerOnePixelCount = newPlayerOneCount;
          this.emit('playerOnePixelChanged', newState.state.player1_shape.pixels);
        }

        if (!_.isEqual(this._playerTwoPixelCount, newPlayerTwoCount)) {
          this._playerTwoPixelCount = newPlayerTwoCount;
          this.emit('playerTwoPixelChanged', newState.state.player2_shape.pixels);
        }
      }
      if (!this._gameEnded && newState.state.status === 'OVER') {
        this._gameEnded = true;
        this.emit('gameEnd');
        this.emit('player1Accuracy', newState.state.accuracy1);
        this.emit('player2Accuracy', newState.state.accuracy2);
      }
    }
  }

  /**
   * Makes a move in the DrawThePerfectShape game.
   * @param player - The player making the move.
   * @param pixels - An array of DrawThePerfectShapePixel objects representing the move's pixels.
   * @throws Error if no game is currently in progress or if there is an issue sending the move command.
   */
  public async makeMove(player: DrawThePerfectShapePlayer, pixels: DrawThePerfectShapePixel[]) {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'GAME_STARTED') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }
    await this._townController.sendInteractableCommand(this.id, {
      type: 'GameMove',
      gameID: instanceID,
      move: {
        player,
        pixels,
      },
    });
  }

  /**
   * Sends a request to the server to change the difficulty of the game
   *
   * @throws An error if the server rejects the request to change the difficulty
   */
  public async pickDifficulty(newDifficulty: DrawThePerfectShapeDifficulty) {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'PickDifficulty',
      gameDifficulty: newDifficulty,
      gameID: instanceID,
    });
    this._instanceID = gameID;
  }

  /**
   * Sends a request to the server to start the game
   *
   * @throws An error if the server rejects the request start the game
   */
  public async startGame() {
    const instanceID = this._instanceID;
    this._gameEnded = false;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'StartGame',
      gameID: instanceID,
    });
    this._instanceID = gameID;
  }
}

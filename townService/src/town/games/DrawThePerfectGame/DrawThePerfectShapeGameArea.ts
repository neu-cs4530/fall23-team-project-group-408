import { assert, trace } from 'console';
import InvalidParametersError, {
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_ID_MISSMATCH_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../../lib/InvalidParametersError';
import Player from '../../../lib/Player';
import {
  DrawThePerfectShapeDifficulty,
  DrawThePerfectShapeGameState,
  DrawThePerfectShapeMove,
  DrawThePerfectShapePixel,
  DrawThePerfectShapeTitle,
  GameInstance,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../../types/CoveyTownSocket';
import DrawThePerfectShapeGame from './DrawThePerfectShapeGame';
import GameArea from '../GameArea';
import Shape from './Shapes/Shape';
import Circle from './Shapes/Circle';
import Square from './Shapes/Square';
import Bird from './Shapes/Bird';
import Car from './Shapes/Car';
import Helicopter from './Shapes/Helicopter';
import House from './Shapes/House';
import Star from './Shapes/Star';
import Umbrella from './Shapes/Umbrella';
import Christmas from './Shapes/Christmas';

/**
 * Dummy comment
 */
export default class DrawThePerfectShapeGameArea extends GameArea<DrawThePerfectShapeGame> {
  private _stateUpdated(updatedState: GameInstance<DrawThePerfectShapeGameState>) {
    if (updatedState.state.status === 'OVER') {
      // If we haven't yet recorded the outcome, do so now.
      const gameID = this._game?.id;
      if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
        const { player1, player2 } = updatedState.state;
        if (player1 && player2) {
          const p1Name =
            this._occupants.find(eachPlayer => eachPlayer.id === player1)?.userName || player1;
          const p2Name =
            this._occupants.find(eachPlayer => eachPlayer.id === player2)?.userName || player2;
          this._history.push({
            gameID,
            difficulty: updatedState.state.difficulty,
            scores: {
              [p1Name]: updatedState.state.winner === player1 ? 1 : 0,
              [p2Name]: updatedState.state.winner === player2 ? 1 : 0,
            },
            accuracy: {
              [p1Name]: updatedState.state.accuracy1,
              [p2Name]: updatedState.state.accuracy2,
            },
          });
        }
      }
    }
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   * - PickDifficulty (picks the difficulty of the game)
   * - StartGame (starts the game)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    switch (command.type) {
      case 'GameMove': {
        this._handleGameMove(player, command.gameID, command.move);
        return undefined as InteractableCommandReturnType<CommandType>;
      }
      case 'JoinGame': {
        return this._handleJoinCommand(player) as InteractableCommandReturnType<CommandType>;
      }
      case 'PickDifficulty': {
        this._handlePickDifficulty(command.gameID, command.gameDifficulty);
        return undefined as InteractableCommandReturnType<CommandType>;
      }
      case 'StartGame': {
        this._handleStartGame(command.gameID);
        return undefined as InteractableCommandReturnType<CommandType>;
      }
      case 'LeaveGame': {
        this._handleLeaveGame(player, command.gameID);
        return undefined as InteractableCommandReturnType<CommandType>;
      }
      default: {
        throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
      }
    }
  }

  /**
   * Handle the Join Command to let the player join the game. If the game doesn't exists or is
   * over, create a new game.
   *
   * @param player player making the request
   * @returns the gameID of the game being created.
   */
  private _handleJoinCommand(player: Player): { gameID: string } {
    let game = this._game;
    if (!game || game.state.status === 'OVER') {
      // No game in progress, make a new one
      game = new DrawThePerfectShapeGame();
      this._game = game;
      this._handleDifficulty(game, game.state.difficulty);
    }
    game.join(player);
    this._stateUpdated(game.toModel());
    return { gameID: game.id };
  }

  /**
   * Handles the player making a game move command.
   *
   * @param player player making the request
   * @param gameID id of the game
   * @param move the move the player is making
   * @throws InvalidParametersError: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   * - or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   */
  private _handleGameMove(player: Player, gameID: string, move: DrawThePerfectShapeMove): void {
    const game = this._game;
    if (!game) {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (this._game?.id !== gameID) {
      throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
    }
    game.applyMove({
      move,
      playerID: player.id,
      gameID,
    });
    this._stateUpdated(game.toModel());
  }

  /**
   * Handles the player choosing the game difficulty
   *
   * @param gameID id of the game
   * @param gameDifficulty the game difficulty the player is choosing
   * @throws InvalidParametersError: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   * - or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   */
  private _handlePickDifficulty(
    gameID: string,
    gameDifficulty: DrawThePerfectShapeDifficulty,
  ): void {
    const game = this._game;
    if (!game) {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (this._game?.id !== gameID) {
      throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
    }
    this._handleDifficulty(game, gameDifficulty);
    game.state.difficulty = gameDifficulty;
    this._stateUpdated(game.toModel());
  }

  /**
   * Handles starting the game
   *
   * @param gameID id of the game
   * @throws InvalidParametersError: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   * - or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   */
  private _handleStartGame(gameID: string): void {
    const game = this._game;
    if (!game) {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (this._game?.id !== gameID) {
      throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
    }
    game.state.last_time = Date.now() / 1000;
    game.state.status = 'GAME_STARTED';
    this._stateUpdated(game.toModel());
  }

  private _handleLeaveGame(player: Player, gameID: string): void {
    const game = this._game;
    if (!game) {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (this._game?.id !== gameID) {
      throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
    }
    game.leave(player);
    this._stateUpdated(game.toModel());
  }

  protected getType(): InteractableType {
    return 'DrawThePerfectShapeArea';
  }

  /**
   * Depending on the difficulty, choose a random shape and set the state to the correct starting
   * parameters
   *
   * @param game the new game state that is being changed
   * @param gameDifficulty the game difficulty the player is choosing
   * * @throws InvalidParametersError: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *
   */
  private _handleDifficulty(
    game: DrawThePerfectShapeGame,
    gameDifficulty: DrawThePerfectShapeDifficulty,
  ): void {
    let difficulties: DrawThePerfectShapeTitle[] = [];
    if (!game || !game.state) {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (gameDifficulty === 'Easy') {
      difficulties = ['Circle', 'Square', 'Star'];
      game.state.timer = 20;
    }
    if (gameDifficulty === 'Medium') {
      difficulties = ['Umbrella', 'House', 'Christmas Tree'];
      game.state.timer = 30;
    }
    if (gameDifficulty === 'Hard') {
      difficulties = ['Helicopter', 'Car', 'Bird'];
      game.state.timer = 40;
    }
    if (difficulties.length > 0) {
      const randomShape = this._getRandomShape(difficulties);
      const traceShapePixels = this._getTraceShapePixels(randomShape);
      const emptyShapePixelsOne: DrawThePerfectShapePixel[] = [];
      const emptyShapePixelsTwo: DrawThePerfectShapePixel[] = [];
      const traceDrawThePerfectShapeShape = new Shape(
        randomShape,
        gameDifficulty,
        traceShapePixels,
      );
      const playerDrawThePerfectShapeShapePlayerOne = new Shape(
        randomShape,
        gameDifficulty,
        emptyShapePixelsOne,
      );
      const playerDrawThePerfectShapeShapePlayerTwo = new Shape(
        randomShape,
        gameDifficulty,
        emptyShapePixelsTwo,
      );
      game.state.trace_shape = traceDrawThePerfectShapeShape;
      game.state.player1_shape = playerDrawThePerfectShapeShapePlayerOne;
      game.state.player2_shape = playerDrawThePerfectShapeShapePlayerTwo;
    }
  }

  /**
   * Gets a random shape.
   *
   * @param shapes the shapes that are avaiable to be picked
   * @returns the randomized shape
   */
  private _getRandomShape(shapes: DrawThePerfectShapeTitle[]): DrawThePerfectShapeTitle {
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  /**
   * Get the pixels of the traced shape
   *
   * @param traceShape the shape being traced
   * @returns the pixels of the shape being traced
   */
  private _getTraceShapePixels(traceShape: DrawThePerfectShapeTitle): DrawThePerfectShapePixel[] {
    switch (traceShape) {
      case 'Circle': {
        return Circle.CIRCLEPIXELS;
      }
      case 'Star': {
        return Star.STARPIXELS;
      }
      case 'Square': {
        return Square.SQUAREPIXELS;
      }
      case 'House': {
        return House.HOUSEPIXELS;
      }
      case 'Umbrella': {
        return Umbrella.UMBRELLAPIXELS;
      }
      case 'Christmas Tree': {
        return Christmas.CHRISTMASPIXELS;
      }
      case 'Car': {
        return Car.CARPIXELS;
      }
      case 'Bird': {
        return Bird.BIRDPIXELS;
      }
      case 'Helicopter': {
        return Helicopter.HELICOPTERPIXELS;
      }
      default: {
        return Circle.CIRCLEPIXELS;
      }
    }
  }
}

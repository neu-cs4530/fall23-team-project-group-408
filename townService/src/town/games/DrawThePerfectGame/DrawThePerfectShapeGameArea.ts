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
            scores: {
              [p1Name]: updatedState.state.winner === player1 ? 1 : 0,
              [p2Name]: updatedState.state.winner === player2 ? 1 : 0,
            },
          });
        }
      }
    }
    this._emitAreaChanged();
  }

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

  private _handleJoinCommand(player: Player): { gameID: string } {
    let game = this._game;
    if (!game || game.state.status === 'OVER') {
      // No game in progress, make a new one
      game = new DrawThePerfectShapeGame();
      this._game = game;
    }
    game.join(player);
    this._stateUpdated(game.toModel());
    return { gameID: game.id };
  }

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
    this._handleDifficulty(gameDifficulty);
    game.state.difficulty = gameDifficulty;
    this._stateUpdated(game.toModel());
  }

  private _handleStartGame(gameID: string): void {
    const game = this._game;
    if (!game) {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (this._game?.id !== gameID) {
      throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
    }
    game.state.start_time = Date.now() / 1000;
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

  private _handleDifficulty(gameDifficulty: DrawThePerfectShapeDifficulty): void {
    let difficulties: DrawThePerfectShapeTitle[] = [];
    if (!this.game || !this.game.state) {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (gameDifficulty === 'Easy') {
      difficulties = ['Circle', 'Square', 'Star'];
      this.game.state.timer = 10;
    }
    if (gameDifficulty === 'Medium') {
      difficulties = ['Umbrella', 'House', 'Christmas Tree'];
      this.game.state.timer = 15;
    }
    if (gameDifficulty === 'Hard') {
      difficulties = ['Helicopter', 'Car', 'Husky'];
      this.game.state.timer = 20;
    }
    if (difficulties.length > 0) {
      const randomShape = this._getRandomShape(difficulties);
      const traceShapePixels = this._getTraceShapePixels(randomShape);
      const emptyShapePixels: DrawThePerfectShapePixel[] = [];
      const traceDrawThePerfectShapeShape = new Shape(
        randomShape,
        gameDifficulty,
        traceShapePixels,
      );
      const playerDrawThePerfectShapeShape = new Shape(
        randomShape,
        gameDifficulty,
        emptyShapePixels,
      );
      this.game.state.trace_shape = traceDrawThePerfectShapeShape;
      this.game.state.player1_shape = playerDrawThePerfectShapeShape;
      this.game.state.player2_shape = playerDrawThePerfectShapeShape;
    }
  }

  private _getRandomShape(shapes: DrawThePerfectShapeTitle[]): DrawThePerfectShapeTitle {
    return shapes[Math.floor(Math.random() * shapes.length)];
  }

  private _getTraceShapePixels(traceShape: DrawThePerfectShapeTitle): DrawThePerfectShapePixel[] {
    // Need to change for all different pictures
    const pixels: DrawThePerfectShapePixel[] = [];
    return pixels;
  }
}

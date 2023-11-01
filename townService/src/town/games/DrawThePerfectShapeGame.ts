import Game from './Game';

import Player from '../../lib/Player';
import {
  DrawThePerfectShapeGameState,
  DrawThePerfectShapeMove,
  GameMove,
} from '../../types/CoveyTownSocket';

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
    throw new Error('Method not implemented.');
  }

  protected _leave(player: Player): void {
    throw new Error('Method not implemented.');
  }
}

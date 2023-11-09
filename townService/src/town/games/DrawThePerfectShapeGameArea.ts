import Player from '../../lib/Player';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';

/**
 * Dummy comment
 */
export default class DrawThePerfectShapeGameArea extends GameArea<DrawThePerfectShapeGame> {
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error('Method not implemented.');
  }

  protected getType(): InteractableType {
    return 'DrawThePerfectShapeArea';
  }
}

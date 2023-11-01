// File for Drawing the perfect shape types


/**
 * Type for the state of a TicTacToe game
 * The state of the game is represented as a list of moves, and the playerIDs of the players (x and o)
 * The first player to join the game is x, the second is o
 */
export interface DrawThePerfectShapeGameState extends WinnableGameState {
  player1?: PlayerID;
  player2?: PlayerID;
  moves: ReadonlyArray<DrawThePerfectShapeMove>;
}

/**
 * Each move 
 */
export interface DrawThePerfectShapeMove {
  player: DrawThePerfectShapePlayer;
  pixel_x: DrawThePerfectShapePixel;
  pixel_y: DrawThePerfectShapePixel;
}

export type DrawThePerfectShapePlayer = 1 | 2; 

export type DrawThePerfectShapePixel = number;

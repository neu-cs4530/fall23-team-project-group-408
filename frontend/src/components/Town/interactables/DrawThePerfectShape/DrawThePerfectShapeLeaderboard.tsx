import React, { useState } from 'react';
import { Table, Tbody, Td, Thead, Tr } from '@chakra-ui/react';
import {
  DrawThePerefectShapeGameResult,
  DrawThePerfectShapeDifficulty,
} from '../../../../types/CoveyTownSocket';

interface PlayerStats {
  difficulty: DrawThePerfectShapeDifficulty;
  player: string;
  wins: number;
  losses: number;
  accuracy: number;
}

/**
 * DrawThePerfecShapeLeaderboard returns a react component of the history of the game. It tracks the difficulty, who wins,
 * loses, and the accuracy of each shape. This leaderboard displays that information in a table and orders the players
 * by name.
 * @param param0 takes in the results of the game so far.
 * @returns A JSX.Element of a ordered table that contains information about the results.
 */
export default function DrawThePerfectShapeLeaderboard({
  results,
}: {
  results: DrawThePerefectShapeGameResult[];
}): JSX.Element {
  const [searchInput, setSearchInput] = useState('');
  const [selectDifficulty, setSelectDifficulty] = useState<DrawThePerfectShapeDifficulty>('Easy');

  const winsLossesTiesByPlayer: Record<
    string,
    Record<DrawThePerfectShapeDifficulty, PlayerStats>
  > = {};

  results.forEach(result => {
    const players = Object.keys(result.scores);

    players.forEach(player => {
      const winner =
        result.scores[player] === Math.max(result.scores[players[0]], result.scores[players[1]]);
      const loser =
        result.scores[player] === Math.min(result.scores[players[0]], result.scores[players[1]]);

      const playerStats = winsLossesTiesByPlayer[player] || {};

      if (winner || loser) {
        const existingAccuracy = playerStats[result.difficulty]?.accuracy || 0;
        const newAccuracy = result.accuracy[player] || 0;
        const maxAccuracy = Math.max(existingAccuracy / 100, newAccuracy);

        const newEntry: PlayerStats = {
          difficulty: result.difficulty,
          player,
          wins: (playerStats[result.difficulty]?.wins || 0) + (winner ? 1 : 0),
          losses: (playerStats[result.difficulty]?.losses || 0) + (loser ? 1 : 0),
          accuracy: Math.round(maxAccuracy * 100),
        };

        playerStats[result.difficulty] = newEntry;
        winsLossesTiesByPlayer[player] = playerStats;
      }
    });
  });

  const rows = Object.keys(winsLossesTiesByPlayer)
    .map(player => Object.values(winsLossesTiesByPlayer[player]))
    .flat();
  rows.sort((a, b) => b.wins - a.wins);

  const filterByPlayers = rows.filter(record =>
    record.player.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const handleDifficultyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectDifficulty(event.target.value as DrawThePerfectShapeDifficulty);
  };

  const filteredResults = filterByPlayers.filter(record => record.difficulty === selectDifficulty);
  return (
    <div>
      <input
        type='text'
        placeholder='Search by Player Name'
        value={searchInput}
        onChange={p => setSearchInput(p.target.value)}
      />
      <label htmlFor='difficultyFilter'>Filter by Difficulty:</label>
      <select id='difficultyFilter' value={selectDifficulty} onChange={handleDifficultyChange}>
        <option value='Easy'>Easy</option>
        <option value='Medium'>Medium</option>
        <option value='Hard'>Hard</option>
      </select>

      <Table>
        <Thead>
          <Tr>
            <th>Difficulty</th>
            <th>Player</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Accuracy</th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredResults.map(record => {
            return (
              <Tr key={`${record.player}_${record.difficulty}`}>
                <Td>{record.difficulty}</Td>
                <Td>{record.player}</Td>
                <Td>{record.wins}</Td>
                <Td>{record.losses}</Td>
                <Td>{record.accuracy}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </div>
  );
}

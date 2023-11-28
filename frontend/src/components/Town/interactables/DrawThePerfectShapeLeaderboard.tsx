import React, { useState } from 'react';
import { Table, Tbody, Td, Thead, Tr } from '@chakra-ui/react';
import {
  DrawThePerefectShapeGameResult,
  DrawThePerfectShapeDifficulty,
} from '../../../types/CoveyTownSocket';

export default function DrawThePerfectShapeLeaderboard({
  results,
}: {
  results: DrawThePerefectShapeGameResult[];
}): JSX.Element {
  const [searchInput, setSearchInput] = useState('');
  const [selectDifficulty, setSelectDifficulty] = useState<DrawThePerfectShapeDifficulty>('Easy');

  const winsLossesTiesByPlayer: Record<
    string,
    {
      difficulty: DrawThePerfectShapeDifficulty;
      player: string;
      wins: number;
      losses: number;
      accuracy: number;
    }
  > = {};

  results.forEach(result => {
    const players = Object.keys(result.scores);
    const p1 = players[0];
    const p2 = players[1];
    const winner =
      result.scores[p1] > result.scores[p2]
        ? p1
        : result.scores[p2] > result.scores[p1]
        ? p2
        : undefined;
    const loser =
      result.scores[p1] < result.scores[p2]
        ? p1
        : result.scores[p2] < result.scores[p1]
        ? p2
        : undefined;
    if (winner) {
      winsLossesTiesByPlayer[winner] = {
        difficulty: result.difficulty,
        player: winner,
        wins: (winsLossesTiesByPlayer[winner]?.wins || 0) + 1,
        losses: winsLossesTiesByPlayer[winner]?.losses || 0,
        accuracy: Math.max(winsLossesTiesByPlayer[winner]?.accuracy, result.accuracy[winner]),
      };
    }
    if (loser) {
      winsLossesTiesByPlayer[loser] = {
        difficulty: result.difficulty,
        player: loser,
        wins: winsLossesTiesByPlayer[loser]?.wins || 0,
        losses: (winsLossesTiesByPlayer[loser]?.losses || 0) + 1,
        accuracy: Math.max(winsLossesTiesByPlayer[loser]?.accuracy, result.accuracy[loser]),
      };
    }
    if (!winner && !loser) {
      winsLossesTiesByPlayer[p1] = {
        difficulty: result.difficulty,
        player: p1,
        wins: winsLossesTiesByPlayer[p1]?.wins || 0,
        losses: winsLossesTiesByPlayer[p1]?.losses || 0,
        accuracy: Math.max(winsLossesTiesByPlayer[p1]?.accuracy, result.accuracy[p1]),
      };
      winsLossesTiesByPlayer[p2] = {
        difficulty: result.difficulty,
        player: p2,
        wins: winsLossesTiesByPlayer[p2]?.wins || 0,
        losses: winsLossesTiesByPlayer[p2]?.losses || 0,
        accuracy: Math.max(winsLossesTiesByPlayer[p2]?.accuracy, result.accuracy[p2]),
      };
    }
  });

  const rows = Object.keys(winsLossesTiesByPlayer).map(player => winsLossesTiesByPlayer[player]);
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
              <Tr key={record.player}>
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

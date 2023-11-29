import React, { useState } from 'react';
import { Select } from '@chakra-ui/react';
import { DrawThePerfectShapeDifficulty } from '../../../../../../shared/types/CoveyTownSocket';

type DifficultyDropDownProps = {
  difficulty: DrawThePerfectShapeDifficulty;
  handleSelectDifficulty: (difficulty: DrawThePerfectShapeDifficulty) => void;
};

/**
 * Drop down menu for selecting difficulty
 * @param props props for the difficulty drop down menu
 * @returns a drop down menu for selecting difficulty
 */
export default function DifficultyDropDown(props: DifficultyDropDownProps): JSX.Element {
  const style: React.CSSProperties = {
    width: 'auto',
    background: '#3CAEA3',
  };

  return (
    <div style={{ width: 'auto' }}>
      <Select
        style={style}
        value={props.difficulty}
        onChange={event => {
          props.handleSelectDifficulty(event.target.value as DrawThePerfectShapeDifficulty);
        }}>
        <option value='Easy'>Easy</option>
        <option value='Medium'>Medium</option>
        <option value='Hard'>Hard</option>
      </Select>
    </div>
  );
}

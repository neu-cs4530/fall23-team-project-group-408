import React, { useState } from 'react';
import { Select } from '@chakra-ui/react';
import { DrawThePerfectShapeDifficulty } from '../../../../../../shared/types/CoveyTownSocket';
import { set } from 'lodash';

type DifficultyDropDownProps = {
  difficulty: DrawThePerfectShapeDifficulty;
  handleSelectDifficulty: (difficulty: DrawThePerfectShapeDifficulty) => void;
};
export default function DifficultyDropDown(props: DifficultyDropDownProps): JSX.Element {
  const style: React.CSSProperties = {
    width: 'auto',
    background: '#3CAEA3',
  };

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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

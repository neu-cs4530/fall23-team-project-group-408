import React, { useState } from 'react';
import { Select } from '@chakra-ui/react';
import { DrawThePerfectShapeDifficulty } from '../../../../../../shared/types/CoveyTownSocket';
import { set } from 'lodash';

type DifficultyDropDownProps = {
  difficulty: DrawThePerfectShapeDifficulty;
  handleSelectDifficulty: (difficulty: DrawThePerfectShapeDifficulty) => void;
};
export default function DifficultyDropDown(props: DifficultyDropDownProps): JSX.Element {
  const [buttonColor, setButtonColor] = useState('green');
  const style: React.CSSProperties = {
    width: 'auto',
    background: buttonColor,
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
          setButtonColor(
            event.target.value === 'Easy'
              ? 'green'
              : event.target.value === 'Medium'
              ? 'yellow'
              : 'red',
          );
        }}>
        <option value='Easy'>Easy</option>
        <option value='Medium' style={{ background: 'yellow' }}>
          Medium
        </option>
        <option value='Hard' style={{ background: 'red' }}>
          Hard
        </option>
      </Select>
    </div>
  );
}

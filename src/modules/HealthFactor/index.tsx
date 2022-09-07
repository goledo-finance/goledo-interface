import React, { memo, type HTMLAttributes } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  value?: string;
}

const Red = Unit.fromMinUnit(1.5);
const Yellow = Unit.fromMinUnit(5);
const Health = Unit.fromMinUnit(200);

const HealthFactor: React.FC<Props> = ({ value, style, ...props }) => {
  const valueUnit = Unit.fromMinUnit(value ?? 0);
  let color = '#3AC170';
  let text = valueUnit?.toDecimalMinUnit(2);
  if (valueUnit.lessThan(Red)) {
    color = '#FE6060';
  } else if (valueUnit.lessThan(Yellow)) {
    color = '#F89F1A';
  } else {
    if (valueUnit.lessThan(Health)) {
      text = 'Health'
    } else {
      text = 'Infinity'
    }
    color = '#3AC170';
  }

  return (
    <span
      style={{ color , ...style }}
      {...props}
    >
      {!!value ? text : '--'}
    </span>
  );
};

export default memo(HealthFactor);

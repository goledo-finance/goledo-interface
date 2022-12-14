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
  let text = valueUnit?.toDecimalMinUnit(2);
  const color = useHealthFactorColor(value);

  if (valueUnit.greaterThanOrEqualTo(Yellow)) {
    if (valueUnit.lessThan(Health)) {
      text = 'Healthy';
    } else {
      text = 'Infinity';
    }
  }

  return (
    <span style={{ color, ...style }} {...props}>
      {!!value ? text : '--'}
    </span>
  );
};

export const useHealthFactorColor = (value?: string) => {
  const valueUnit = Unit.fromMinUnit(value ?? 0);
  let color = '#3AC170';
  if (valueUnit.lessThan(Red)) {
    color = '#FE6060';
  } else if (valueUnit.lessThan(Yellow)) {
    color = '#F89F1A';
  } else {
    color = '#3AC170';
  }
  return color;
};

export default memo(HealthFactor);

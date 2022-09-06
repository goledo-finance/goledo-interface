import React, { type HTMLAttributes } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  value?: Unit | string;
}

const Zero = Unit.fromMinUnit(0);
const PointZeroOne = Unit.fromMinUnit(0.0001);
const Hundred = Unit.fromMinUnit(100);

const PercentageText: React.FC<Props> = ({ value, style, ...props }) => {
  const usedValue = typeof value === 'string' ? Unit.fromMinUnit(value).div(Hundred) : value;
  const isZero = usedValue && usedValue.equalsWith(Zero);
  const isLtThanPointZeroOne = usedValue && usedValue.lessThan(PointZeroOne);

  return <span {...props}>{isZero ? '0%' : isLtThanPointZeroOne ? '<0.01%' : `${usedValue ? usedValue.mul(Hundred).toDecimalMinUnit(2) : '--'}%`}</span>;
};

export default PercentageText;

import React, { type HTMLAttributes } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  value?: Unit | string;
}

const PointZeroOne = Unit.fromMinUnit(0.0001);
const Hundred = Unit.fromMinUnit(100);

const PercentageText: React.FC<Props> = ({ value, style, ...props }) => {
  const usedValue = typeof value === 'string' ? Unit.fromMinUnit(value).div(Hundred) : value;
  const isLtThanPointZeroOne = usedValue && usedValue.lessThan(PointZeroOne);
  return <span {...props}>{isLtThanPointZeroOne ? '<0.01%' : `${usedValue ? usedValue.mul(Hundred).toDecimalMinUnit(2) : '--'}%`}</span>;
};

export default PercentageText;

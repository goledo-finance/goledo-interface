import React from 'react';
import { Unit, type useStatus } from '@cfxjs/use-wallet-react/conflux/Fluent';
import Tooltip from '@components/Tooltip';
import { type Props as PopperProps } from '@components/Popper';
import numFormat from '@utils/numFormat';

interface Props {
  className?: string;
  balance?: Unit;
  status?: ReturnType<typeof useStatus>;
  symbolPrefix?: string;
  symbol?: string;
  decimals?: number;
  abbrDecimals?: 2 | 4;
  id?: string;
  showEllipsis?: boolean;
  placement?: PopperProps['placement'];
}

const abbrStr = {
  2: '0.01',
  4: '0.0001',
}

const BalanceText: React.FC<Props> = ({ className, balance, status, id, symbolPrefix, symbol, decimals = 18, abbrDecimals = 4, showEllipsis = false,  placement }) => {
  if (!balance) {
    return (
      <span className={className} id={id}>
        {status === 'active' ? 'loading...' : '--'}
      </span>
    );
  }

  const decimalStandardUnit = balance.toDecimalStandardUnit(undefined, decimals);
  if (decimalStandardUnit !== '0' && Unit.lessThan(balance, Unit.fromStandardUnit(abbrStr[abbrDecimals], Number(decimals)))) {
    return (
      <Tooltip text={`${numFormat(decimalStandardUnit)}${symbol ? ` ${symbol}` : ''}`} placement={placement} interactive delay={0}>
        <span className={className} id={id}>
          {symbolPrefix ?? ''}＜{abbrStr[abbrDecimals]}{symbol ? ` ${symbol}` : ''}
        </span>
      </Tooltip>
    );
  }

  const nought = decimalStandardUnit.split('.')[1];
  const noughtLen = nought ? nought.length : 0;
  return (
    <Tooltip text={`${numFormat(decimalStandardUnit)}${symbol ? ` ${symbol}` : ''}`} placement={placement} disabled={noughtLen < abbrDecimals} interactive delay={0}>
      <span className={className} id={id}>
        { noughtLen >= abbrDecimals
          ? `${symbolPrefix ?? ''}${numFormat(balance.toDecimalStandardUnit(abbrDecimals, decimals))}${showEllipsis ? '...' : ''}${symbol ? ` ${symbol}` : ''}`
          : `${symbolPrefix ?? ''}${numFormat(balance.toDecimalStandardUnit(undefined, decimals))}${symbol ? ` ${symbol}` : ''}`}
      </span>
    </Tooltip>
  );
};

export default BalanceText;

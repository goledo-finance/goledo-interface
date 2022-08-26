import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useMedia } from 'react-use';
import { useTokens, TokenInfo, useCurUserBorrowPrice, useCurUserSupplyAPY } from '@store/index';
import tokensIcon from '@assets/tokens';
import styles from '../../index.module.css';

const Zero = Unit.fromMinUnit(0);
const PointZeroOne = Unit.fromMinUnit(0.01);
const Hundred = Unit.fromMinUnit(100);

const Content: React.FC<{ token: TokenInfo }> = ({ token }) => {
  return (
    <div className={styles.content}>
      <div className={styles.item}>
        <div className={styles.icon}>
          <img src={tokensIcon[token.symbol]} alt="goledo" className="w-8 h-8 mr-3" />
          {token.symbol}
        </div>
      </div>
      <div className={styles.item}>
        <span>{token.supplyBalance?.toDecimalStandardUnit(2, token.decimals)}</span>
        <span>${token.supplyPrice?.toDecimalStandardUnit(2)}</span>
      </div>
      <div className={styles.item}>{token.supplyAPY?.greaterThan(PointZeroOne) ? `${token.supplyAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}</div>
      <div className={styles.item}>{String(token.collateral)}</div>
      <div className={styles.item}>
        <div className={styles.button}>
          <button>Withdraw</button>
        </div>
      </div>
    </div>
  );
};

const YourSupplies: React.FC = () => {
  const tokens = useTokens();
  const isWide = useMedia('(min-width: 640px)');
  const curUserSupplyTokens = useMemo(() => tokens?.filter((token) => token.supplyBalance?.greaterThan(Zero)), [tokens]);
  const curUserSupplyPrice = useCurUserBorrowPrice();
  const curUserSupplyAPY = useCurUserSupplyAPY();
  const totalCollateralPrice = useMemo(
    () =>
      !curUserSupplyTokens?.length
        ? undefined
        : curUserSupplyTokens.filter((token) => token.collateral).reduce((pre, cur) => pre.add(cur.supplyPrice ?? Zero), Zero),
    [curUserSupplyTokens]
  );

  const Header = (
    <div className={styles.header}>
      <div className={styles.item}>Assets</div>
      <div className={styles.item}>Balance</div>
      <div className={styles.item}>APY</div>
      <div className={styles.item}>Collateral</div>
      <div className={styles.item}></div>
    </div>
  );

  return (
    <div className={styles.table}>
      <div className={styles.title}>
        <span>Your Supplies</span>
        <div className={styles.hide}>Hide</div>
      </div>
      <div className={styles.subheader}>
        <div className={styles.gap}>
          <span className={styles.data}>{`balance $${curUserSupplyPrice?.toDecimalStandardUnit(2)}`}</span>
          <span className={styles.data}>{`APY ${curUserSupplyAPY?.mul(Hundred).toDecimalMinUnit(2)}%`}</span>
          <span className={styles.data}>{`Collateral $${totalCollateralPrice?.toDecimalStandardUnit(2)}`}</span>
        </div>
      </div>
      {isWide ? (
        <div className={styles.container}>
          {Header}
          {curUserSupplyTokens?.map((token) => (
            <Content token={token} key={token.address} />
          ))}
        </div>
      ) : (
        <>
          {curUserSupplyTokens?.map((token) => (
            <div className={styles.container} key={token.address}>
              {Header}
              <Content token={token} />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default YourSupplies;

import React, { useMemo } from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useMedia } from 'react-use';
import styles from '../../index.module.css';
import { useTokens, TokenInfo, useCurUserBorrowPrice, useCurUserBorrowAPY, useUserData } from '@store/index';

const Zero = Unit.fromMinUnit(0);
const PointZeroOne = Unit.fromMinUnit(0.01);
const Hundred = Unit.fromMinUnit(100);

const Content: React.FC<{ token: TokenInfo }> = ({ token }) => {
  return (
    <div className={styles.content}>
      <div className={styles.item}>
        <div className={styles.icon}>
          <img src={`src/assets/icons/tokens/${token.symbol.toLowerCase()}.svg`} alt="goledo" className="w-8 h-8 mr-3" />
          {token.symbol}
        </div>
      </div>
      <div className={styles.item}>
        <span>{token.borrowBalance?.toDecimalStandardUnit(2, token.decimals)}</span>
        <span>${token.borrowPrice?.toDecimalStandardUnit(2)}</span>
      </div>
      <div className={styles.item}>{token.borrowAPY?.greaterThan(PointZeroOne) ? `${token.borrowAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}</div>
      <div className={styles.item}>
        <div className={styles.button}>
          <button>Repay</button>
          <button>Borrow</button>
        </div>
      </div>
    </div>
  );
};

const YourBorrows: React.FC = () => {
  const tokens = useTokens();
  const isWide = useMedia('(min-width: 640px)');
  const curUserBorrowTokens = useMemo(() => tokens?.filter((token) => token.borrowBalance?.greaterThan(Zero)), [tokens]);
  const curUserBorrowPrice = useCurUserBorrowPrice();
  const curUserBorrowAPY = useCurUserBorrowAPY();
  const userData = useUserData();

  const Header = (
    <div className={styles.header}>
      <div className={styles.item}>Assets</div>
      <div className={styles.item}>Debt</div>
      <div className={styles.item}>APY</div>
      <div className={styles.item}></div>
    </div>
  );

  return (
    <div className={styles.table}>
      <div className={styles.title}>
        <span>Your Borrows</span>
        <div className={styles.hide}>Hide</div>
      </div>
      <div className={styles.subheader}>
        <div className={styles.gap}>
          <span className={styles.data}>{`balance $${curUserBorrowPrice?.toDecimalStandardUnit(2)}`}</span>
          <span className={styles.data}>{`APY ${curUserBorrowAPY?.mul(Hundred).toDecimalMinUnit(2)}%`}</span>
          <span className={styles.data}>{`Borrow power used ${userData?.borrowPowerUsed ? `${userData?.borrowPowerUsed}%` : '--'}`}</span>
        </div>
      </div>
      {isWide ? (
        <div className={styles.container}>
          {Header}
          {curUserBorrowTokens?.map((token) => (
            <Content token={token} key={token.address} />
          ))}
        </div>
      ) : (
        <>
          {curUserBorrowTokens?.map((token) => (
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

export default YourBorrows;

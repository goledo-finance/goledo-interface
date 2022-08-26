import React from 'react';
import { Link } from 'react-router-dom';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useMedia } from 'react-use';
import { useTokens, TokenInfo } from '@store/index';
import tokensIcon from '@assets/tokens';
import styles from '../index.module.css';

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
      <div className={styles.item}>{token.balance?.toDecimalStandardUnit(2, token.decimals)}</div>
      <div className={styles.item}>{token.supplyAPY?.greaterThan(PointZeroOne) ? `${token.supplyAPY.mul(Hundred).toDecimalMinUnit(2)}%` : '<0.01%'}</div>
      <div className={styles.item}>{String(token.collateral)}</div>
      <div className={styles.item}>
        <div className={styles.button}>
          <button>Supply</button>
          <button>
            <Link to={`/detail/${token.address}`} className="text-white no-underline">
              Detail
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
};

const AssetsToSupply: React.FC = () => {
  const tokens = useTokens();
  const isWide = useMedia('(min-width: 640px)');

  const Header = (
    <div className={styles.header}>
      <div className={styles.item}>Assets</div>
      <div className={styles.item}>Balance</div>
      <div className={styles.item}>APY</div>
      <div className={styles.item}>Can be collateral</div>
      <div className={styles.item}></div>
    </div>
  );

  return (
    <div className={styles.table}>
      <div className={styles.title}>
        <span>Assets to Supply</span>
        <div className={styles.hide}>Hide</div>
      </div>
      <div className={styles.subheader}>
        Show assets with 0 balance
        <span>BRIDGES AND FAUCETS</span>
      </div>
      {isWide ? (
        <div className={styles.container}>
          {Header}
          {tokens?.map((token) => (
            <Content token={token} key={token.address} />
          ))}
        </div>
      ) : (
        <>
          {tokens?.map((token) => (
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

export default AssetsToSupply;

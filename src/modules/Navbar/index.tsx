import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { connect } from '@cfxjs/use-wallet-react/ethereum';
import styles from './index.module.css';
import cx from 'clsx';

const NaveItem: React.FC<{ to: string; children: React.ReactElement<any> | string }> = ({ to, children }) => {
  const location = useLocation();
  console.log(location?.pathname, to);
  return (
    <li className="flex items-center relative">
      <Link
        className={cx(styles.link, {
          [styles.active]: location?.pathname === to,
        })}
        to={to}
      >
        {children}
      </Link>
    </li>
  );
};

const Navbar: React.FC = () => {
  return (
    <header className={styles.header}>
      <nav className={cx('flex h-60px t-0 sticky py-8px px-20px items-center justify-between', styles.nav)}>
        <div className="flex items-center">
          <img src="/src/assets/imgs/logo-w.svg" alt="An SVG of an eye" className="h-34px mr-32px" />
          <ul className="flex items-center gap-24px m-0 p-0">
            <NaveItem to="/dashboard">Dashboard</NaveItem>
            <NaveItem to="/markets">Markets</NaveItem>
            <NaveItem to="/stake">Stake</NaveItem>
          </ul>
        </div>
        <div>
          <button
            onClick={connect}
            className={cx('border-#FDF9F9 border rounded-full h-36px text-#E2B26A px-2 cursor-pointer', styles.button)}
          >
            Connect Wallet
          </button>
        </div>
      </nav>
      <div></div>
    </header>
  );
};

export default Navbar;

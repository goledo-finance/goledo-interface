import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from '@cfxjs/use-wallet-react/ethereum';
import styles from './index.module.css';

const Navbar: React.FC = () => {
  return (
    <header className={styles.header}>
      <nav className="flex gap-24px h-60px border-b-1px border-#FEFEFE">
        <button onClick={connect}>Connect Wallet</button>
        <Link to="dashboard">Dashboard</Link>
        <Link to="markets">Markets</Link>
      </nav>

      <div></div>
    </header>
  );
};

export default Navbar;

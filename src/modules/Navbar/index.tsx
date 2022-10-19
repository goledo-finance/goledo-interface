import React, { useState, useEffect, type ComponentProps } from 'react';
import cx from 'clsx';
import { Link, useLocation } from 'react-router-dom';
import { shortenAddress } from '@utils/address';
import { useAccount } from '@cfxjs/use-wallet-react/ethereum';
import Dropdown from '@components/Dropdown';
import AuthConnectButton from '@modules/AuthConnectButton';
import GoledoWhite from '@assets/tokens/goledo-white.svg';
import Mobile from './Mobile';
import './index.css';

const NavLink: React.FC<ComponentProps<typeof Link> & { curPath: string }> = ({ to, children, curPath }) => (
  <li className={cx('navbar-link relative flex items-center px-14px h-full overflow-hidden', { ['navbar-link--active']: curPath?.startsWith(to as string) })}>
    <Link id='nav-bar-item-link' className="flex items-center h-full text-#F1F1F3 decoration-none select-none" to={to}>
      {children}
    </Link>
  </li>
);

const Navbar: React.FC = () => {
  const { pathname: curPath } = useLocation();
  const account = useAccount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [curPath]);

  return (
    <header className='flex justify-center h-61px bg-#111 border-b-1px border-#FEFEFE border-opacity-15 '>
      <Mobile open={isMobileMenuOpen} curPath={curPath === '/' ? '/dashboard' : curPath} />
      <nav className={cx('max-w-1920px mx-auto absolute flex items-center w-full h-60px px-32px bg-#111 z-100')}>
        <img src={GoledoWhite} alt="goledo icon" className="w-34px h-34px mr-auto sm:mr-40px" />
        <ul className="navbar-linkArea display-none sm:flex h-full items-center text-14px font-semibold">
          <NavLink to="/dashboard" curPath={curPath === '/' ? '/dashboard' : curPath} id='nav-bar-dashboard-link'>
            Dashboard
          </NavLink>
          <NavLink to="/markets" curPath={curPath} id='nav-bar-markets-link'>
            Markets
          </NavLink>
          <NavLink to="/stake" curPath={curPath} id='nav-bar-stake-link'>
            Stake
          </NavLink>
        </ul>
        <More />

        <AuthConnectButton className='min-w-156px !rounded-100px'>
          <div className='flex items-center px-12px h-36px rounded-100px border-1px border-#ebebed1f text-14px text-#F1F1F3 font-semibold'>
            {shortenAddress(account)}
          </div>
        </AuthConnectButton>

        <label className='burger-container ml-20px sm:display-none' htmlFor="burger-check" >
          <input className="burger-check" id="burger-check" type="checkbox" checked={isMobileMenuOpen} onChange={e => setIsMobileMenuOpen(e.target.checked)} />
          <span className='burger' />
        </label>
      </nav>
    </header>
  );
};

const MoreContent: React.FC = () => {
  return (
    <div className="min-w-200px rounded-8px bg-white dropdown-shadow text-14px font-semibold no-underline overflow-hidden">
      <a
        id='nav-bar-faq-link'
        className="relative flex items-center h-44px px-50px text-#160042 hover:bg-#F1F1F3 transition-colors no-underline"
        href="https://goledo.gitbook.io/goledo/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="i-bi:question-circle absolute left-16px text-20px" />
        FAQ
      </a>
      <a
        id='nave-bar-telegram-link'
        className="relative flex items-center h-44px px-50px text-#160042 hover:bg-#F1F1F3 transition-colors no-underline"
        href="https://t.me/GoledoFinance"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="i-logos:telegram absolute left-16px text-20px" />
        Telegram
      </a>
      <a
        id='nav-bar-github-link'
        className="relative flex items-center h-44px px-50px text-#160042 hover:bg-#F1F1F3 transition-colors no-underline"
        href="https://github.com/goledo-finance/goledo-interface"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="i-ant-design:github-filled absolute left-16px text-20px" />
        Github
      </a>
    </div>
  );
};

const More: React.FC = () => {
  return (
    <Dropdown id='nav-bar-more-dropdown' placement="bottom-start" trigger="mouseenter click" interactiveDebounce={100} Content={<MoreContent />}>
      <div className="display-none sm:flex mr-auto relative items-center px-14px h-full rounded-6px text-14px text-#F1F1F3 font-semibold hover:bg-#fafbfc14 transition-colors select-none cursor-pointer">
        More
        <span className='i-ci:more-horizontal text-28px ml-2px translate-y-1px' />
      </div>
    </Dropdown>
  );
};

export default Navbar;

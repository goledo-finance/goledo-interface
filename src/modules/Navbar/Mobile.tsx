import React, { type ComponentProps } from 'react';
import cx from 'clsx';
import { Link } from 'react-router-dom';

const NavLink: React.FC<ComponentProps<typeof Link> & { curPath: string }> = ({ to, children, curPath }) => (
  <li className={cx('relative flex items-center h-48px', { ['nav-link-mobile--active']: curPath?.startsWith(to as string) })}>
    <Link className="flex items-center h-full text-#F1F1F3 decoration-none select-none" to={to}>
      {children}
    </Link>
  </li>
);

const Mobile: React.FC<{ open: boolean; curPath: string }> = ({ open, curPath }) => {
  return (
    <div
      className={cx(
        'nav-mobile sm:display-none absolute w-full h-[calc(100vh-60px)] left-0 top-60px bg-#303549e0 transition-transform duration-300 z-50 translate-y-[-100vh]',
        open && 'translate-y-0px'
      )}
    >
      <p className="mt-32px pl-40px text-12px text-#A5A8B6 font-semibold">Menu</p>
      <ul className="pl-40px flex flex-col gap-12px mt-8px text-22px font-semibold">
        <NavLink to="/dashboard" curPath={curPath} id='nav-bar-mobile-dashboard-link'>
          Dashboard
        </NavLink>
        <NavLink to="/markets" curPath={curPath} id='nav-bar-mobile-markets-link'>
          Markets
        </NavLink>
        <NavLink to="/stake" curPath={curPath} id='nav-bar-mobile-stake-link'>
          Stake
        </NavLink>
      </ul>

      <div className="mb-40px w-full h-1px bg-#F2F3F729 " />

      <p className="pl-40px mb-12px text-12px text-#A5A8B6 font-semibold">Links</p>

      <div className="pl-24px text-16px font-semibold no-underline">
        <a
          id='nav-bar-mobile-faq-link'
          className="relative flex items-center h-44px px-50px text-#F1F1F3 no-underline"
          href="https://goledo.gitbook.io/goledo/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="i-bi:question-circle absolute left-16px text-20px" />
          FAQ
        </a>
        <a
          id='nav-bar-telegram-mobile-link'
          className="relative flex items-center h-44px px-50px text-#F1F1F3 no-underline"
          href="https://t.me/GoledoFinance"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="i-logos:telegram absolute left-16px text-20px" />
          Telegram
        </a>
        <a
          id='nav-bar-github-mobile-link'
          className="relative flex items-center h-44px px-50px text-#F1F1F3 no-underline"
          href="https://github.com/goledo-finance/goledo-interface"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="i-ant-design:github-filled absolute left-16px text-20px" />
          Github
        </a>
      </div>
    </div>
  );
};

export default Mobile;

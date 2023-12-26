import React from 'react';
import PeckShieldLogo from '@assets/imgs/PeckShieldLogo-b.svg';
import PythLogo from '@assets/imgs/pyth.png';

const Footer: React.FC = () => {
  return (
    <footer className="mt-80px lt-sm:mt-64px flex justify-center items-center h-60px bg-transparent border-t-1px border-#E5E5E5">
      <a
        id="footer-audit"
        className="relative flex items-center text-14px text-#BABABA no-underline"
        href="https://github.com/peckshield/publications/blob/master/audit_reports/PeckShield-Audit-Report-Goledo-v1.0.pdf"
        target="_blank"
        rel="noopener noreferrer"
      >
        Audit by
        <img className="ml-6px w-113px h-25px select-none" src={PeckShieldLogo} draggable={false} alt="Peck shield" />
      </a>

      <div className='inline-block w-1px h-24px mx-24px bg-#E5E5E5 pointer-events-none select-none'/>

      <span id="footer-powered" className="relative flex items-center text-14px text-#BABABA no-underline">
        Powered by
        <img className="ml-6px w-66px h-22px select-none" src={PythLogo} draggable={false} alt="Peck shield" />
      </span>
    </footer>
  );
};

export default Footer;

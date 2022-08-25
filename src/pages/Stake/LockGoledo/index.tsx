import React from 'react';
import { Unit } from '@cfxjs/use-wallet-react/ethereum';
import { useGoledoLockAPR } from '@store/index';

const Hundred = Unit.fromMinUnit(100);

const LockGoledo: React.FC = () => {
  const lockAPR = useGoledoLockAPR();

  return (
    <div>
      <p className='flex'>
        <span className='mr-auto'>Lock Goledo</span>
        <span>APR {lockAPR?.mul(Hundred).toDecimalStandardUnit(4)}%</span>
      </p>

      <p>Lock Goledo and earn platform fees and penalty fees in unlocked Goledo.</p>
      <p>Locked Goledo is subjext to a three month lock and will continue to earn fees after the locks expire if you do not withdraw.</p>
      <button>Lock</button>
    </div>
  );
};

export default LockGoledo;

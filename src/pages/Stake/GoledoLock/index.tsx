import React from 'react';
import { useGoledoLockeds } from '@store/index';

const GoledoLocks: React.FC = () => {
  const lockeds = useGoledoLockeds();
  
  return (
    <div>
      <p>Goledo Lock</p>
      {lockeds?.map(({ unlockTime, balance }) =>
        <div className='flex gap-40px' key={unlockTime}>
          <span>{balance.toDecimalStandardUnit(2)} Goledo</span>
          <span>{new Date(unlockTime).toString()}</span>
        </div>
      )}
    </div>
  );
};

export default GoledoLocks;

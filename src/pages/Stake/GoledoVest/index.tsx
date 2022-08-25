import React from 'react';
import { useGoledoVestings } from '@store/index';

const GoledoVest: React.FC = () => {
  const vestings = useGoledoVestings();
  
  return (
    <div>
      <p>Goledo Vest</p>
      {vestings?.map(({ unlockTime, balance }) =>
        <div className='flex gap-40px' key={unlockTime}>
          <span>{balance.toDecimalStandardUnit(2)} Goledo</span>
          <span>{new Date(unlockTime).toString()}</span>
        </div>
      )}
    </div>
  );
};

export default GoledoVest;

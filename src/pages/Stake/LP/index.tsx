import React from 'react';
import { useLp } from '@store/index'

const LP: React.FC = () => {
  const { stakedBalance } = useLp();
  
  return <div>GOL/CFX LP</div>;
};

export default LP;

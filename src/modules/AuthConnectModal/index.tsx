import React from 'react';
import { walletConfig } from '@store/wallet';
import AuthConnectOption from '@modules/AuthConnectOption';

const AuthConnectModal: React.FC = () => {
  return (
    <div>
      {walletConfig.map((item, index) => (
        <AuthConnectOption name={item.name} icon={item.icon} key={index} />
      ))}
    </div>
  );
};

export default AuthConnectModal;

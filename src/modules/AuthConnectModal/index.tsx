import React from 'react';
import { walletConfig, walletFunction } from '@utils/wallet';
import AuthConnectOption from '@modules/AuthConnectOption';

const AuthConnectModal: React.FC = () => {
  return (
    <div>
      {walletConfig.map((item, index) => (
        <AuthConnectOption
          name={item.name}
          icon={item.icon}
          connect={walletFunction[item.name].connect}
          useStatus={walletFunction[item.name].useStatus}
          key={index}
          index={index}
        />
      ))}
    </div>
  );
};

export default AuthConnectModal;

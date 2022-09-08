import { type PropsWithChildren } from 'react';
import Card from '@components/Card';
import AuthConnectButton from '@modules/AuthConnectButton';

const AuthConnectPage = ({ children }: PropsWithChildren) => {
  return (
    <Card className="w-full flex flex-col justify-center items-center min-h-[calc(100vh-380px)] text-center">
      <div className="flex justify-center items-center w-100px h-100px text-50px rounded-full bg-#B4C0D0">
        <span className="i-fa-solid:link text-white" />
      </div>
      <p className="mt-20px mb-12px text-20px text-#303549 font-semibold">Connect Your Wallet</p>
      {children}
      <AuthConnectButton className="mt-30px min-w-156px !rounded-100px" />
    </Card>
  );
};

export default AuthConnectPage;

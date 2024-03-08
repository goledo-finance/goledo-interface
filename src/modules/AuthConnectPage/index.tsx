import Card from '@components/Card';
import AuthConnectButton from '@modules/AuthConnectButton';
import Network from '@utils/Network';
import cx from 'clsx';
import { useAccount, useChainId } from '@store/wallet';
import CurrentNetwork from '@utils/Network';

const AuthConnectPage = ({ children, className, childrenPrefix }: { children: (action: string) => React.ReactNode; className?: string; childrenPrefix?: React.ReactNode; }) => {
  const account = useAccount();
  const chainId = useChainId();
  const chainMatch = chainId === CurrentNetwork.chainId;

  const action = !account ? 'Connect your wallet' : !chainMatch ? 'Switch your Network' : '';
  return (
    <Card className={cx('w-full flex flex-col justify-center items-center min-h-[calc(100vh-380px)] text-center', className)}>
      {childrenPrefix}
      <div className="flex justify-center items-center w-100px h-100px text-50px rounded-full bg-#B4C0D0">
        <span className="i-fa-solid:link text-white" />
      </div>
      <p className="mt-20px mb-12px text-20px text-#303549 font-semibold">
        {action} to {Network.chainName}
      </p>
      {children(action)}
      <AuthConnectButton className="mt-30px min-w-156px !rounded-100px" />
    </Card>
  );
};

export default AuthConnectPage;

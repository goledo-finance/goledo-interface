import React from 'react';
import SummaryPanel from './SummaryPanel';
import Rewards from './Rewards';
import YourSupplies from './YourSupplies';
import AssetsToSupply from './AssetsToSupply';
import YourBorrows from './YourBorrows';
import AssetsToBorrow from './AssetsToBorrow';

const DashBoard: React.FC = () => {
  return (
    <div className="flex flex-col px-2 sm:px-20px md:px-48px lg:px-96px gap-16px">
      <SummaryPanel />
      <Rewards />
      <div className="flex gap-16px flex-col items-center xl:flex-row xl:items-start">
        <div className="flex flex-1 flex-col gap-16px w-full">
          <YourSupplies />
          <AssetsToSupply />
        </div>
        <div className="flex flex-1 flex-col gap-16px w-full">
          <YourBorrows />
          <AssetsToBorrow />
        </div>
      </div>
    </div>
  );
};

export default DashBoard;

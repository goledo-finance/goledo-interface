import React from 'react';
import SummaryPanel from './SummaryPanel';
import Rewards from './Rewards';
import YourSupplies from './YourSupplies';
import AssetsToSupply from './AssetsToSupply';
import YourBorrows from './YourBorrows';
import AssetsToBorrow from './AssetsToBorrow';

const DashBoard: React.FC = () => {
  return (
    <div className="flex flex-col px-2 sm:px-96px">
      <SummaryPanel />
      <Rewards />
      <YourSupplies />
      <AssetsToSupply />
      <YourBorrows />
      <AssetsToBorrow />
    </div>
  );
};


export default DashBoard;

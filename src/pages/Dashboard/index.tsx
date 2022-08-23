import React from 'react';
import SummaryPanel from './SummaryPanel';
import YourSupplies from './YourSupplies';
import AssetsToSupply from './AssetsToSupply';
import YourBorrows from './YourBorrows';
import AssetsToBorrow from './AssetsToBorrow';

const DashBoard: React.FC = () => {
  return (
    <div>
      <SummaryPanel />
      <YourSupplies />
      <AssetsToSupply />
      <YourBorrows />
      <AssetsToBorrow />
    </div>
  );
};


export default DashBoard;

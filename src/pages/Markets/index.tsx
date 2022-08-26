import React from 'react';
import SummaryPanel from './SummaryPanel';
import Assets from './Assets';

const Markets: React.FC = () => {
  return (
    <div className="flex flex-col px-2 sm:px-20px md:px-48px lg:px-96px gap-16px">
        <SummaryPanel />
        <Assets />
    </div>
  );
};


export default Markets;

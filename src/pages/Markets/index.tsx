import React from 'react';
import PageHeader from '@modules/Layout/PageHeader';
import PageWrapper from '@modules/Layout/PageWrapper';
import SummaryPanel from './SummaryPanel';
import Assets from './Assets';

const Markets: React.FC = () => {
  return (
    <>
      <PageHeader>
        <SummaryPanel />
      </PageHeader>
      <PageWrapper>
        <Assets />
      </PageWrapper>
    </>
  );
};

export default Markets;

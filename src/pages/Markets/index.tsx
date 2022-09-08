import React from 'react';
import PageHeader from '@modules/Layout/PageHeader';
import PageWrapper from '@modules/Layout/PageWrapper';
import AuthConnectPage from '@modules/AuthConnectPage';
import useIsAuthed from '@hooks/useIsAuthed';
import SummaryPanel from './SummaryPanel';
import Assets from './Assets';

const Markets: React.FC = () => {
  const isAuthed = useIsAuthed();

  return (
    <>
      <PageHeader>
        <SummaryPanel />
      </PageHeader>
      <PageWrapper>
        {!isAuthed && (
          <AuthConnectPage>
            <p className="text-14px text-#62677B">
              Conncet your wallet to see your market details.
            </p>
          </AuthConnectPage>
        )}
        {isAuthed && <Assets />}
      </PageWrapper>
    </>
  );
};

export default Markets;

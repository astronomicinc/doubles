import { Suspense } from 'react';
import MatchPageContent from './content';

function MatchPageLoading() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px 20px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '16px', color: '#666' }}>
        Loading your matches...
      </div>
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={<MatchPageLoading />}>
      <MatchPageContent />
    </Suspense>
  );
}

import { Suspense } from 'react';

async function TestContent() {
  return (
    <div style={{padding: '20px', fontFamily: 'sans-serif', fontSize: '16px'}}>
      <h1>Test Route Works!</h1>
      <p>Basic async component rendering correctly.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestContent />
    </Suspense>
  );
}

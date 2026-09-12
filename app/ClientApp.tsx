'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { WahLoadingScreen } from '../src/components/common/WahLoadingScreen';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
});

export default function ClientApp() {
  const [appLoaded, setAppLoaded] = useState(false);
  const [messagesFinished, setMessagesFinished] = useState(false);

  useEffect(() => {
    // App component has mounted successfully.
    setAppLoaded(true);
  }, []);

  const shouldShowLoading = !appLoaded || !messagesFinished;

  return (
    <>
      <App />

      {shouldShowLoading && (
        <WahLoadingScreen
          onComplete={() => {
            setMessagesFinished(true);
          }}
        />
      )}
    </>
  );
}
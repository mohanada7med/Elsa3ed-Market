'use client';

import dynamic from 'next/dynamic';
import { WahLoadingScreen } from '../src/components/common/WahLoadingScreen';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => <WahLoadingScreen />,
});

export default function ClientApp() {
  return <App />;
}

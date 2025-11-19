import React from 'react';
import {StatusBar} from 'expo-status-bar';
import {AppProvider} from './src/context/AppContext';
import {AppNavigation} from './src/navigation/AppNavigation';

const App: React.FC = () => {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <AppNavigation />
    </AppProvider>
  );
};

export default App;


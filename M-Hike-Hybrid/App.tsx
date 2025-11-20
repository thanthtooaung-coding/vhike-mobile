import React from 'react';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from './src/context/AuthContext';
import {AppProvider} from './src/context/AppContext';
import {AppNavigation} from './src/navigation/AppNavigation';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <AppNavigation />
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;


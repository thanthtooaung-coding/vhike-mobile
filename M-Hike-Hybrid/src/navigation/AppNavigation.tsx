import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types';
import HikeListScreen from '../screens/HikeListScreen';
import AddHikeScreen from '../screens/AddHikeScreen';
import SearchHikeScreen from '../screens/SearchHikeScreen';
import HikeDetailScreen from '../screens/HikeDetailScreen';
import MapPickerScreen from '../screens/MapPickerScreen';
import HikeConfirmationScreen from '../screens/HikeConfirmationScreen';
import AddObservationScreen from '../screens/AddObservationScreen';
import ObservationDetailScreen from '../screens/ObservationDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HikeList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen
          name="HikeList"
          component={HikeListScreen}
          options={{title: 'My Hikes'}}
        />
        <Stack.Screen
          name="AddHike"
          component={AddHikeScreen}
          options={{title: 'Add Hike'}}
        />
        <Stack.Screen
          name="SearchHikes"
          component={SearchHikeScreen}
          options={{title: 'Search Hikes'}}
        />
        <Stack.Screen
          name="HikeDetail"
          component={HikeDetailScreen}
          options={{title: 'Hike Details'}}
        />
        <Stack.Screen
          name="MapPicker"
          component={MapPickerScreen}
          options={{title: 'Pick Location'}}
        />
        <Stack.Screen
          name="HikeConfirmation"
          component={HikeConfirmationScreen}
          options={{title: 'Hike Saved'}}
        />
        <Stack.Screen
          name="AddObservation"
          component={AddObservationScreen}
          options={{title: 'Add Observation'}}
        />
        <Stack.Screen
          name="ObservationDetail"
          component={ObservationDetailScreen}
          options={{title: 'Observation Details'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {RootStackParamList} from '../types';
import {useAuth} from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HikeListScreen from '../screens/HikeListScreen';
import AddHikeScreen from '../screens/AddHikeScreen';
import SearchHikeScreen from '../screens/SearchHikeScreen';
import HikeDetailScreen from '../screens/HikeDetailScreen';
import MapPickerScreen from '../screens/MapPickerScreen';
import HikeConfirmationScreen from '../screens/HikeConfirmationScreen';
import AddObservationScreen from '../screens/AddObservationScreen';
import ObservationDetailScreen from '../screens/ObservationDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import TextContentScreen from '../screens/TextContentScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigation: React.FC = () => {
  const {currentUser, isLoading} = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFA5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={currentUser ? 'HikeList' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        {!currentUser ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{title: 'Sign Up'}}
            />
          </>
        ) : (
          <>
        <Stack.Screen
          name="HikeList"
          component={HikeListScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AddHike"
          component={AddHikeScreen}
          options={({route}) => ({
            title: route.params?.hikeId ? 'Edit Hike' : 'Add a New Hike',
          })}
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
          options={{headerShown: false}}
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
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{title: 'Settings'}}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{title: 'Edit Profile'}}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{title: 'Change Password'}}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={TextContentScreen}
          options={{title: 'Privacy Policy'}}
        />
        <Stack.Screen
          name="TermsOfService"
          component={TextContentScreen}
          options={{title: 'Terms of Service'}}
        />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});


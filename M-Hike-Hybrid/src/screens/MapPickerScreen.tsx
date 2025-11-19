import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import * as Location from 'expo-location';
import {Ionicons} from '@expo/vector-icons';
import {RootStackParamList} from '../types';
import {GeocodingService} from '../services/GeocodingService';
import Constants from 'expo-constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MapPickerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Google Maps API key for geocoding
    // Try to get from app.json config
    const googleMapsApiKey = 
      Constants.expoConfig?.android?.config?.googleMaps?.apiKey ||
      Constants.expoConfig?.ios?.config?.googleMapsApiKey;
    
    if (googleMapsApiKey) {
      GeocodingService.setApiKey(googleMapsApiKey);
    }
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required. Please enable it in settings.'
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const {latitude, longitude} = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);
      // Set initial selected location to current location
      setSelectedLocation({latitude, longitude});
      setLoading(false);
    } catch (error) {
      console.error('Location error:', error);
      setLoading(false);
      Alert.alert('Error', 'Could not get your location. Please select on the map.');
    }
  };

  const handleMapPress = (event: any) => {
    const coordinate = event.nativeEvent?.coordinate;
    if (coordinate) {
      const {latitude, longitude} = coordinate;
      setSelectedLocation({latitude, longitude});
      console.log('Location selected:', latitude, longitude);
    }
  };

  const handleConfirm = async () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }

    try {
      // Use GeocodingService to get formatted address
      // This tries expo-location first, then Google Maps API as fallback
      // Similar to Kotlin's Geocoder.getAddressLine(0)
      const result = await GeocodingService.reverseGeocode(
        selectedLocation.latitude,
        selectedLocation.longitude
      );

      // Pass location data back through navigation
      navigation.navigate('AddHike', {
        pickedLocation: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          location: result.formattedAddress,
        },
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to coordinates if everything fails
      navigation.navigate('AddHike', {
        pickedLocation: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          location: `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`,
        },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00897B" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        onLongPress={handleMapPress}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}>
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Selected Location"
            pinColor="#00897B"
            draggable
            onDragEnd={(e) => {
              const {latitude, longitude} = e.nativeEvent.coordinate;
              setSelectedLocation({latitude, longitude});
            }}
          />
        )}
      </MapView>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.button}
          onPress={getCurrentLocation}>
          <Ionicons name="locate" size={24} color="#00897B" />
          <Text style={styles.buttonText}>My Location</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!selectedLocation}>
          <Text style={styles.confirmButtonText}>
            {selectedLocation ? 'Confirm Location' : 'Select on Map'}
          </Text>
        </TouchableOpacity>
      </View>
      {selectedLocation && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Selected: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
          </Text>
          <Text style={styles.infoHint}>Tap anywhere on map or drag marker to change</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#00897B',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#00897B',
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  infoBox: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoHint: {
    fontSize: 10,
    color: '#666',
  },
});

export default MapPickerScreen;


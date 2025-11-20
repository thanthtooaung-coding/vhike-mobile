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

  const [addressText, setAddressText] = useState<string>('');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const googleMapsApiKey = 
      Constants.expoConfig?.android?.config?.googleMaps?.apiKey ||
      Constants.expoConfig?.ios?.config?.googleMapsApiKey;
    
    if (googleMapsApiKey) {
      GeocodingService.setApiKey(googleMapsApiKey);
    }
    
    getCurrentLocation();
  }, []);

  const updateLocationWithAddress = async (latitude: number, longitude: number) => {
    setSelectedLocation({latitude, longitude});
    
    setAddressText('Fetching address...');

    try {
      const result = await GeocodingService.reverseGeocode(latitude, longitude);
      
      setAddressText(result.formattedAddress);
    } catch (error) {
      setAddressText(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const {latitude, longitude} = location.coords;
      
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      await updateLocationWithAddress(latitude, longitude);
      
      setLoading(false);
    } catch (error) {
      console.error('Location error:', error);
      setLoading(false);
      Alert.alert('Error', 'Could not get your location.');
    }
  };

  const handleMapPress = (event: any) => {
    const coordinate = event.nativeEvent?.coordinate;
    if (coordinate) {
      updateLocationWithAddress(coordinate.latitude, coordinate.longitude);
    }
  };

  const handleConfirm = async () => {
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }

    let finalAddress = addressText;
    if (!finalAddress || finalAddress.trim() === '' || finalAddress === 'Fetching address...') {
      finalAddress = `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`;
    }

    navigation.navigate('AddHike', {
      pickedLocation: {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        location: finalAddress.trim(),
      },
    });
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
              updateLocationWithAddress(latitude, longitude);
            }}
          />
        )}
      </MapView>

      {selectedLocation && (
        <View style={styles.infoBox}>
          <Text style={styles.infoTextLabel}>Selected Location:</Text>
          <Text style={styles.infoText}>
            {addressText} 
          </Text>
          <Text style={styles.infoHint}>Tap map or drag marker to change</Text>
        </View>
      )}

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
    padding: 15,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  infoTextLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoHint: {
    fontSize: 10,
    color: '#00897B',
  },
});

export default MapPickerScreen;
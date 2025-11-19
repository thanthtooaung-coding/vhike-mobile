import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {MaterialIcons} from '@expo/vector-icons';
import {RootStackParamList, AddHikeFormState} from '../types';
import {useAppContext} from '../context/AppContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type AddHikeRouteProp = RouteProp<RootStackParamList, 'AddHike'>;

const AddHikeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddHikeRouteProp>();
  const {addHike, updateHike, getHikeById, addHikeFormState, setAddHikeFormState} =
    useAppContext();
  const [formState, setFormState] = useState<AddHikeFormState>(addHikeFormState);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const hikeIdToEdit = route.params?.hikeId;

  useEffect(() => {
    if (hikeIdToEdit) {
      loadHikeForEditing();
    } else {
      setFormState({
        hikeName: '',
        location: '',
        description: '',
        lengthUnit: 'km',
        duration: '',
        elevation: '',
        difficultyLevel: 'Easy',
        parkingAvailable: false,
        trailType: 'Loop',
      });
    }
  }, [hikeIdToEdit]);

  useEffect(() => {
    // Handle location picked from map
    const pickedLocation = route.params?.pickedLocation;
    if (pickedLocation) {
      console.log('Location picked from map:', pickedLocation);
      setFormState(prevState => ({
        ...prevState,
        location: pickedLocation.location,
        latitude: pickedLocation.latitude,
        longitude: pickedLocation.longitude,
      }));
      // Clear the pickedLocation from params to avoid re-triggering
      navigation.setParams({pickedLocation: undefined});
    }
  }, [route.params?.pickedLocation, navigation]);

  const loadHikeForEditing = async () => {
    if (!hikeIdToEdit) return;
    const hike = await getHikeById(hikeIdToEdit);
    if (hike) {
      setFormState({
        hikeId: hike.id,
        hikeName: hike.hikeName,
        location: hike.location,
        description: hike.description || '',
        hikeDate: hike.hikeDate,
        hikeLength: hike.hikeLength,
        lengthUnit: 'km',
        duration: hike.duration,
        elevation: hike.elevation?.toString() || '',
        difficultyLevel: hike.difficultyLevel,
        parkingAvailable: hike.parkingAvailable,
        trailType: hike.trailType,
        latitude: hike.latitude,
        longitude: hike.longitude,
      });
    }
  };

  const handleSave = async () => {
    if (!formState.hikeName.trim() || !formState.location.trim()) {
      Alert.alert('Error', 'Name and Location are required.');
      return;
    }
    if (!formState.hikeDate) {
      Alert.alert('Error', 'Please select a date.');
      return;
    }
    if (!formState.hikeLength || formState.hikeLength <= 0) {
      Alert.alert('Error', 'Please enter a valid length.');
      return;
    }

    setLoading(true);
    try {
      const elevationAsNumber = formState.elevation
        ? parseFloat(formState.elevation)
        : undefined;

      const hikeData = {
        hikeName: formState.hikeName,
        location: formState.location,
        hikeDate: formState.hikeDate!,
        parkingAvailable: formState.parkingAvailable,
        hikeLength: formState.hikeLength,
        difficultyLevel: formState.difficultyLevel,
        trailType: formState.trailType,
        description: formState.description || undefined,
        latitude: formState.latitude,
        longitude: formState.longitude,
        duration: formState.duration,
        elevation: elevationAsNumber,
      };

      if (hikeIdToEdit) {
        await updateHike({...hikeData, id: hikeIdToEdit});
        navigation.goBack();
      } else {
        const savedId = await addHike(hikeData);
        navigation.navigate('HikeConfirmation', {hikeId: savedId});
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save hike. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Hike Name *</Text>
        <TextInput
          style={styles.input}
          value={formState.hikeName}
          onChangeText={text => setFormState({...formState, hikeName: text})}
          placeholder="Enter hike name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Location *</Text>
        <View style={styles.locationRow}>
          <TextInput
            style={[styles.input, styles.locationInput]}
            value={formState.location}
            onChangeText={text => setFormState({...formState, location: text})}
            placeholder="Enter location"
          />
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => {
              navigation.navigate('MapPicker');
            }}>
            <MaterialIcons name="map" size={24} color="#00897B" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Date *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>
            {formState.hikeDate
              ? formState.hikeDate.toLocaleDateString()
              : 'Select date'}
          </Text>
          <MaterialIcons name="calendar-today" size={20} color="#00897B" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={formState.hikeDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                setFormState({...formState, hikeDate: date});
              }
            }}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Length (km) *</Text>
        <TextInput
          style={styles.input}
          value={formState.hikeLength?.toString() || ''}
          onChangeText={text => {
            const num = parseFloat(text);
            setFormState({
              ...formState,
              hikeLength: isNaN(num) ? undefined : num,
            });
          }}
          placeholder="Enter length"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Duration</Text>
        <TextInput
          style={styles.input}
          value={formState.duration}
          onChangeText={text => setFormState({...formState, duration: text})}
          placeholder="e.g., 3 hours"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Elevation (m)</Text>
        <TextInput
          style={styles.input}
          value={formState.elevation}
          onChangeText={text => setFormState({...formState, elevation: text})}
          placeholder="Enter elevation"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Difficulty Level</Text>
        <View style={styles.pickerRow}>
          {['Easy', 'Moderate', 'Hard', 'Very Hard'].map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.pickerOption,
                formState.difficultyLevel === level && styles.pickerOptionSelected,
              ]}
              onPress={() => setFormState({...formState, difficultyLevel: level})}>
              <Text
                style={[
                  styles.pickerOptionText,
                  formState.difficultyLevel === level &&
                    styles.pickerOptionTextSelected,
                ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Trail Type</Text>
        <View style={styles.pickerRow}>
          {['Loop', 'Out & Back', 'Point to Point'].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.pickerOption,
                formState.trailType === type && styles.pickerOptionSelected,
              ]}
              onPress={() => setFormState({...formState, trailType: type})}>
              <Text
                style={[
                  styles.pickerOptionText,
                  formState.trailType === type && styles.pickerOptionTextSelected,
                ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Parking Available</Text>
          <Switch
            value={formState.parkingAvailable}
            onValueChange={value =>
              setFormState({...formState, parkingAvailable: value})
            }
            trackColor={{false: '#767577', true: '#00897B'}}
            thumbColor={formState.parkingAvailable ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formState.description}
          onChangeText={text => setFormState({...formState, description: text})}
          placeholder="Enter description"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Hike</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    marginRight: 8,
  },
  mapButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  pickerOptionSelected: {
    backgroundColor: '#00897B',
    borderColor: '#00897B',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#00897B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddHikeScreen;


import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import {MaterialIcons} from '@expo/vector-icons';
import {RootStackParamList, AddObservationFormState} from '../types';
import {useAppContext} from '../context/AppContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProp = RouteProp<RootStackParamList, 'AddObservation'>;

const AddObservationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const {hikeId, observationId} = route.params;
  const {
    addObservation,
    updateObservation,
    getObservationById,
    uploadPhoto,
    addObservationFormState,
    setAddObservationFormState,
  } = useAppContext();
  const [formState, setFormState] = useState<AddObservationFormState>({
    ...addObservationFormState,
    hikeId,
    observationTime: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (observationId) {
      loadObservationForEditing();
    }
  }, [observationId]);

  const loadObservationForEditing = async () => {
    const observation = await getObservationById(observationId);
    if (observation) {
      setFormState({
        observationId: observation.id,
        hikeId: observation.hikeId,
        observationText: observation.observationText,
        observationTime: observation.observationTime,
        additionalComments: observation.additionalComments || '',
        photoUrl: observation.photoUrl,
        latitude: observation.latitude,
        longitude: observation.longitude,
      });
    }
  };

  const handlePickImage = async () => {
    try {
      const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Photo library permission is required to select photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.uri) {
          setUploading(true);
          const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
          const uploadedUrl = await uploadPhoto(asset.uri, fileName);
          setUploading(false);
          if (uploadedUrl) {
            setFormState({...formState, photoUrl: uploadedUrl});
          } else {
            Alert.alert('Error', 'Failed to upload photo. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formState.observationText.trim()) {
      Alert.alert('Error', 'Observation text is required.');
      return;
    }

    setLoading(true);
    try {
      const observationData = {
        hikeId: formState.hikeId!,
        observationText: formState.observationText,
        observationTime: formState.observationTime || new Date(),
        additionalComments: formState.additionalComments || undefined,
        photoUrl: formState.photoUrl,
        latitude: formState.latitude,
        longitude: formState.longitude,
      };

      if (observationId) {
        await updateObservation({...observationData, id: observationId});
      } else {
        await addObservation(observationData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save observation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Observation Text *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formState.observationText}
          onChangeText={text =>
            setFormState({...formState, observationText: text})
          }
          placeholder="Enter your observation"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>
            {formState.observationTime
              ? formState.observationTime.toLocaleString()
              : 'Select time'}
          </Text>
          <MaterialIcons name="access-time" size={20} color="#00897B" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={formState.observationTime || new Date()}
            mode="datetime"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) {
                setFormState({...formState, observationTime: date});
              }
            }}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Additional Comments</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formState.additionalComments}
          onChangeText={text =>
            setFormState({...formState, additionalComments: text})
          }
          placeholder="Enter additional comments"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Photo</Text>
        {formState.photoUrl ? (
          <View style={styles.photoContainer}>
            <Image source={{uri: formState.photoUrl}} style={styles.photo} />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => setFormState({...formState, photoUrl: undefined})}>
              <MaterialIcons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.photoButton}
            onPress={handlePickImage}
            disabled={uploading}>
            {uploading ? (
              <ActivityIndicator color="#00897B" />
            ) : (
              <>
                <MaterialIcons name="camera-alt" size={24} color="#00897B" />
                <Text style={styles.photoButtonText}>Add Photo</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>
            {observationId ? 'Update Observation' : 'Save Observation'}
          </Text>
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00897B',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    backgroundColor: '#f9f9f9',
  },
  photoButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#00897B',
    fontWeight: '600',
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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

export default AddObservationScreen;

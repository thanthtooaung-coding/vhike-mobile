import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import {MaterialIcons} from '@expo/vector-icons';
import {RootStackParamList, Hike, SearchFilters} from '../types';
import {useAppContext} from '../context/AppContext';
import {format} from 'date-fns';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SearchHikeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {searchHikes} = useAppContext();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<Hike[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const searchResults = await searchHikes(filters);
    setResults(searchResults);
    setLoading(false);
  };

  const renderHikeItem = ({item}: {item: Hike}) => (
    <TouchableOpacity
      style={styles.hikeCard}
      onPress={() => navigation.navigate('HikeDetail', {hikeId: item.id})}>
      <View style={styles.hikeContent}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="landscape" size={32} color="#00897B" />
        </View>
        <View style={styles.hikeInfo}>
          <Text style={styles.hikeName}>{item.hikeName}</Text>
          <Text style={styles.hikeLocation}>{item.location}</Text>
          <Text style={styles.hikeMeta}>
            {format(item.hikeDate, 'MMM dd, yyyy')} • {item.hikeLength} km
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={filters.name || ''}
            onChangeText={text => setFilters({...filters, name: text})}
            placeholder="Search by name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={filters.location || ''}
            onChangeText={text => setFilters({...filters, location: text})}
            placeholder="Search by location"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>
              {filters.selectedDate
                ? format(filters.selectedDate, 'MMM dd, yyyy')
                : 'Select date (optional)'}
            </Text>
            <MaterialIcons name="calendar-today" size={20} color="#00897B" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={filters.selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setFilters({...filters, selectedDate: date});
                }
              }}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Length Range (km)</Text>
          <View style={styles.rangeRow}>
            <TextInput
              style={[styles.input, styles.rangeInput]}
              value={filters.lengthMin?.toString() || ''}
              onChangeText={text => {
                const num = parseFloat(text);
                setFilters({
                  ...filters,
                  lengthMin: isNaN(num) ? undefined : num,
                });
              }}
              placeholder="Min"
              keyboardType="numeric"
            />
            <Text style={styles.rangeSeparator}>-</Text>
            <TextInput
              style={[styles.input, styles.rangeInput]}
              value={filters.lengthMax?.toString() || ''}
              onChangeText={text => {
                const num = parseFloat(text);
                setFilters({
                  ...filters,
                  lengthMax: isNaN(num) ? undefined : num,
                });
              }}
              placeholder="Max"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <MaterialIcons name="search" size={20} color="#fff" />
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setFilters({});
            setResults([]);
          }}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00897B" />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderHikeItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {results.length === 0 && !loading
                  ? 'No results. Try adjusting your search criteria.'
                  : ''}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
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
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInput: {
    flex: 1,
  },
  rangeSeparator: {
    marginHorizontal: 8,
    fontSize: 16,
    color: '#666',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00897B',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resetButton: {
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  resetButtonText: {
    color: '#00897B',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  hikeCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  hikeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 137, 123, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hikeInfo: {
    flex: 1,
  },
  hikeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  hikeLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  hikeMeta: {
    fontSize: 14,
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SearchHikeScreen;


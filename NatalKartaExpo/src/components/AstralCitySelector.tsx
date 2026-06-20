import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { City } from '../types';

interface AstralCitySelectorProps {
  citySearch: string;
  onCitySearchChange: (text: string) => void;
  isSearchingCities: boolean;
  showCityList: boolean;
  filteredCities: City[];
  onSelectCity: (city: City) => void;
  onFocus?: () => void;
  placeholder?: string;
}

// Optimized list item component to avoid re-renders
const CityListItem = React.memo(({ item, onSelect }: { item: City; onSelect: (city: City) => void }) => {
  return (
    <TouchableOpacity style={styles.cityItem} onPress={() => onSelect(item)} activeOpacity={0.7}>
      <View style={styles.cityTextRow}>
        <Text style={styles.cityName}>{item.name}</Text>
        <Text style={styles.cityCountry}>{item.country}</Text>
      </View>
      {item.admin_name1 && <Text style={styles.cityRegion}>{item.admin_name1}</Text>}
    </TouchableOpacity>
  );
});

CityListItem.displayName = 'CityListItem';

const AstralCitySelector: React.FC<AstralCitySelectorProps> = ({
  citySearch,
  onCitySearchChange,
  isSearchingCities,
  showCityList,
  filteredCities,
  onSelectCity,
  onFocus,
  placeholder = 'Начните вводить название города',
}) => {
  // Memoized renderItem to prevent re-creation on every render
  const renderItem = useCallback(
    ({ item }: { item: City }) => <CityListItem item={item} onSelect={onSelectCity} />,
    [onSelectCity]
  );

  const keyExtractor = useCallback(
    (item: City, index: number) => `${item.name}-${item.country}-${item.latitude}-${item.longitude}-${index}`,
    []
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.citySearchInput}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.4)"
          value={citySearch}
          onChangeText={onCitySearchChange}
          onFocus={onFocus}
          autoComplete="off"
          autoCorrect={false}
        />

        {isSearchingCities && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFD700" />
          </View>
        )}
      </View>

      {showCityList && filteredCities.length > 0 && (
        <View style={styles.cityListContainer}>
          <FlatList
            data={filteredCities}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            style={styles.cityList}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  citySearchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    paddingRight: 45,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(157, 101, 255, 0.25)',
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'serif',
  },
  loadingContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityListContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(157, 101, 255, 0.3)',
    maxHeight: 200,
    overflow: 'hidden',
  },
  cityList: {
    maxHeight: 200,
  },
  cityItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(157, 101, 255, 0.15)',
  },
  cityTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cityName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'serif',
  },
  cityCountry: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'serif',
  },
  cityRegion: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'serif',
  },
});

export default AstralCitySelector;

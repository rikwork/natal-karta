import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { City } from '../../../types';
import AstralCitySelector from '../../../components/AstralCitySelector';

interface BirthPlaceStepProps {
  citySearch: string;
  onCitySearchChange: (text: string) => void;
  isSearchingCities: boolean;
  showCityList: boolean;
  filteredCities: City[];
  onSelectCity: (city: City) => void;
  onFocus: () => void;
  scrollViewRef?: React.RefObject<ScrollView>;
}

const BirthPlaceStep: React.FC<BirthPlaceStepProps> = ({
  citySearch,
  onCitySearchChange,
  isSearchingCities,
  showCityList,
  filteredCities,
  onSelectCity,
  onFocus,
  scrollViewRef,
}) => {
  return (
    <View style={styles.stepContainer}>
      <AstralCitySelector
        citySearch={citySearch}
        onCitySearchChange={onCitySearchChange}
        isSearchingCities={isSearchingCities}
        showCityList={showCityList}
        filteredCities={filteredCities}
        onSelectCity={onSelectCity}
        onFocus={onFocus}
        scrollViewRef={scrollViewRef}
        scrollBackToTopOnSelect={true}
      />
      <Text style={styles.hintText}>Выберите город из списка</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default BirthPlaceStep;

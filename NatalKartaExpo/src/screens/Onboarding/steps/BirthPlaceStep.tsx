import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { City } from '../../../types';

interface BirthPlaceStepProps {
    citySearch: string;
    onCitySearchChange: (text: string) => void;
    isSearchingCities: boolean;
    showCityList: boolean;
    filteredCities: City[];
    onSelectCity: (city: City) => void;
    onFocus: () => void;
}

const BirthPlaceStep: React.FC<BirthPlaceStepProps> = ({
    citySearch,
    onCitySearchChange,
    isSearchingCities,
    showCityList,
    filteredCities,
    onSelectCity,
    onFocus,
}) => {
    return (
        <View style={styles.stepContainer}>
            <View style={styles.citySearchContainer}>
                <TextInput
                    style={styles.citySearchInput}
                    placeholder="Начните вводить название города"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={citySearch}
                    onChangeText={onCitySearchChange}
                    onFocus={onFocus}
                />

                {isSearchingCities && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#FFD700" />
                        <Text style={styles.loadingText}>Поиск городов...</Text>
                    </View>
                )}

                {showCityList && filteredCities.length > 0 && (
                    <View style={styles.cityListContainer}>
                        <FlatList
                            data={filteredCities}
                            keyExtractor={(item, index) => `${item.name} - ${item.country} - ${index}`}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.cityItem} onPress={() => onSelectCity(item)}>
                                    <Text style={styles.cityName}>{item.name}</Text>
                                    <Text style={styles.cityCountry}>{item.country}</Text>
                                    {item.admin_name1 && <Text style={styles.cityRegion}>{item.admin_name1}</Text>}
                                </TouchableOpacity>
                            )}
                            style={styles.cityList}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                )}
            </View>

            <Text style={styles.hintText}>Выберите город из списка</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    citySearchContainer: {
        position: 'relative',
        zIndex: 1000,
    },
    citySearchInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 16,
        fontSize: 18,
        color: '#ffffff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        marginBottom: 10,
        textAlign: 'center',
    },
    loadingContainer: {
        position: 'absolute',
        right: 15,
        top: '50%',
        marginTop: -10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    loadingText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        marginLeft: 8,
    },
    cityListContainer: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(26,26,46,0.95)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        maxHeight: 200,
        zIndex: 1001,
    },
    cityList: {
        maxHeight: 200,
    },
    cityItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    cityName: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    cityCountry: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    cityRegion: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
    },
    hintText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default BirthPlaceStep;

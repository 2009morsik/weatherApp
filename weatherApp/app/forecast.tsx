import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_KEY = '4bab1135e84f88608fc00b3799e2a2e9';

const getForecastData = async (city: string) => {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=ru`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        return null;
    }
};

const Forecast = () => {
    const [city, setCity] = useState<string>('Москва'); // Устанавливаем дефолтный город
    const [forecast, setForecast] = useState<any>(null); // Прогноз погоды
    const [isLoading, setIsLoading] = useState(true); // Статус загрузки
    const [isModalVisible, setIsModalVisible] = useState(false); // Статус видимости модального окна
    const [cities, setCities] = useState<string[]>(['Москва', 'Нью-Йорк', 'Лондон', 'Париж', 'Токио','Екатеринбург', 'Ханты-Мансийск']); // Пример списка городов

    useEffect(() => {
        const loadCityFromStorage = async () => {
            try {
                const storedCity = await AsyncStorage.getItem('selectedCity');
                if (storedCity) {
                    setCity(storedCity); // Устанавливаем сохраненный город
                }
            } catch (error) {
                console.error('Error loading city from AsyncStorage:', error);
            }
        };

        loadCityFromStorage();
    }, []); // Этот useEffect выполняется только при монтировании компонента

    useEffect(() => {
        const fetchForecast = async () => {
            setIsLoading(true);
            const data = await getForecastData(city);
            setForecast(data);
            setIsLoading(false);
        };

        if (city) {
            fetchForecast(); // Перезапускаем запрос при изменении города
        }
    }, [city]); // Когда city изменится, запрос прогноза будет выполнен заново

    const handleCitySelect = (selectedCity: string) => {
        setCity(selectedCity); // Обновляем город
        AsyncStorage.setItem('selectedCity', selectedCity); // Сохраняем выбранный город в AsyncStorage
        setIsModalVisible(false); // Закрываем модальное окно
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    if (!forecast) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Не удалось загрузить прогноз.</Text>
            </View>
        );
    }

    const getForecastForDay = (dayOffset: number) => {
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);
        const dateString = date.toISOString().split('T')[0]; // Получаем строку вида YYYY-MM-DD

        return forecast.list.filter((item: any) => item.dt_txt.startsWith(dateString))[0]; // Получаем первый прогноз для этого дня
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Прогноз погоды в {city}</Text>

            {/* Карточки для сегодня, завтра и послезавтра */}
            <View style={styles.forecastCardsContainer}>
                {['Сегодня', 'Завтра', 'Послезавтра'].map((label, index) => {
                    const dayForecast = getForecastForDay(index);
                    if (!dayForecast) return null; // Если прогноз не найден

                    return (
                        <View key={index} style={styles.forecastCard}>
                            <Text style={styles.forecastDate}>{label}</Text>
                            <Text style={styles.forecastTemp}>{Math.round(dayForecast.main.temp)}°C</Text>
                            <Image
                                source={{ uri: `https://openweathermap.org/img/wn/${dayForecast.weather[0].icon}.png` }}
                                style={styles.weatherIcon}
                            />
                            <Text style={styles.forecastDescription}>{dayForecast.weather[0].description}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Модальное окно для выбора города */}
            <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.button}>
                <Text style={styles.buttonText}>Выбрать город</Text>
            </TouchableOpacity>

            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Выберите город</Text>
                        {cities.map((cityName) => (
                            <TouchableOpacity key={cityName} onPress={() => handleCitySelect(cityName)} style={styles.cityButton}>
                                <Text style={styles.cityButtonText}>{cityName}</Text>
                            </TouchableOpacity>
                        ))}
                        <Button title="Закрыть" onPress={() => setIsModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f4f4f4',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    forecastCardsContainer: {
        width: '100%',
        maxWidth: 1000,
        paddingBottom: 20,
    },
    forecastCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginVertical: 10,
        width: '90%',
        maxWidth: 320,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        alignSelf: 'center',
    },
    forecastDate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    forecastTemp: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginVertical: 10,
    },
    weatherIcon: {
        width: 80,
        height: 40,
        alignSelf: 'center',
    },
    forecastDescription: {
        fontSize: 18,
        color: '#777',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
    },
    errorText: {
        fontSize: 18,
        color: '#d9534f',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#4A90E2',
        padding: 10,
        borderRadius: 5,
        marginVertical: 1,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    cityButton: {
        padding: 10,
        backgroundColor: '#f1f1f1',
        marginVertical: 1,
        borderRadius: 5,
    },
    cityButtonText: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default Forecast;

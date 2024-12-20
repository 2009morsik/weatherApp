import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, Modal, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// API ключ для получения данных о погоде
const API_KEY = '4bab1135e84f88608fc00b3799e2a2e9';

// Список доступных городов для выбора
const cities = ['Москва', 'Нью-Йорк', 'Лондон', 'Париж', 'Токио', 'Екатеринбург', 'Ханты-Мансийск'];

// Функция для получения данных о погоде для выбранного города
const getWeatherData = async (city: string) => {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ru`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;  // Возвращаем null в случае ошибки
    }
};

const WeatherApp = () => {
    // Состояние для хранения выбранного города
    const [city, setCity] = useState('Москва'); // Начальный город — Москва
    // Состояние для хранения данных о погоде
    const [weather, setWeather] = useState<any>(null);
    // Состояние для управления видимостью модального окна
    const [isModalVisible, setIsModalVisible] = useState(false);
    // Состояние для управления индикатором загрузки
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();  // Используем роутер для навигации

    // Эффект для загрузки города из AsyncStorage при старте приложения
    useEffect(() => {
        const loadCityFromStorage = async () => {
            try {
                const storedCity = await AsyncStorage.getItem('selectedCity');
                if (storedCity) {
                    setCity(storedCity); // Если город сохранен в AsyncStorage, устанавливаем его
                }
            } catch (error) {
                console.error('Error loading city from AsyncStorage:', error);
            }
        };

        loadCityFromStorage();
    }, []);  // Эффект выполняется только один раз при загрузке компонента

    // Эффект для получения данных о погоде при изменении города
    useEffect(() => {
        const fetchWeather = async () => {
            setIsLoading(true);  // Включаем индикатор загрузки
            const data = await getWeatherData(city);  // Получаем данные о погоде для выбранного города
            setWeather(data);  // Сохраняем данные о погоде в состояние
            setIsLoading(false);  // Выключаем индикатор загрузки
        };

        if (city) {
            fetchWeather();  // Если город выбран, запрашиваем погоду
        }
    }, [city]);  // Эффект срабатывает при изменении города

    // Если данные о погоде загружаются, показываем индикатор загрузки
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </View>
        );
    }

    // Если погода не была получена, показываем сообщение об ошибке
    if (!weather) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Не удалось загрузить погоду.</Text>
            </View>
        );
    }

    // Округляем температуру до целого числа
    const temperature = Math.round(weather.main.temp);
    const pressure = (weather.main.pressure * 0.750063).toFixed(0); // Давление в hPa
    const humidity = weather.main.humidity; // Влажность в %
    const windSpeed = weather.wind.speed; // Скорость ветра в м/с

    // Функция для получения соответствующей иконки для состояния погоды
    const getWeatherImage = (weatherCondition: string) => {
        const weatherImages: { [key: string]: string } = {
            'ясно': 'https://openweathermap.org/img/wn/01d.png',
            'облачно с прояснениями': 'https://openweathermap.org/img/wn/02d.png',
            'переменная облачность': 'https://openweathermap.org/img/wn/02d.png',
            'гром': 'https://openweathermap.org/img/wn/03d.png',
            'облачно': 'https://openweathermap.org/img/wn/04d.png',
            'пасмурно': 'https://openweathermap.org/img/wn/04d.png',
            'небольшой дождь': 'https://openweathermap.org/img/wn/09d.png',
            'дождь': 'https://openweathermap.org/img/wn/10d.png',
            'гроза': 'https://openweathermap.org/img/wn/11d.png',
            'снег': 'https://openweathermap.org/img/wn/13d.png',
            'туман': 'https://openweathermap.org/img/wn/50d.png',
            'небольшой снег': 'https://openweathermap.org/img/wn/13d.png',
        };

        return weatherImages[weatherCondition.toLowerCase()] || weatherImages['ясно'];
    };

    const handleCitySelect = (selectedCity: string) => {
        setCity(selectedCity);
        setIsModalVisible(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Текущая погода в {weather.name}</Text>

            <View style={styles.weatherInfoContainer}>
                <Text style={styles.temperature}>{temperature}°C</Text>
                <Image
                    source={{ uri: getWeatherImage(weather.weather[0].description) }}
                    style={styles.weatherIcon}
                />
                <Text style={styles.description}>{weather.weather[0].description}</Text>
            </View>

            {/* Добавляем информацию о давлении, влажности и скорости ветра */}
            <View style={styles.weatherDetailsContainer}>
                <Text style={styles.weatherDetails}>Давление: {pressure} мм рт. ст.</Text>
                <Text style={styles.weatherDetails}>Влажность: {humidity}%</Text>
                <Text style={styles.weatherDetails}>Скорость ветра: {windSpeed} м/с</Text>
            </View>

            <TouchableOpacity onPress={() => router.push('/forecast')} style={styles.button}>
                <Text style={styles.buttonText}>Прогноз на несколько дней</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.button}>
                <Text style={styles.buttonText}>Выберите город</Text>
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
    weatherInfoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    temperature: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: 10,
    },
    weatherIcon: {
        width: 100,
        height: 100,
    },
    description: {
        fontSize: 20,
        color: '#777',
    },
    weatherDetailsContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    weatherDetails: {
        fontSize: 18,
        color: '#555',
        marginVertical: 5,
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4A90E2',
        height: 50,
        borderRadius: 25,
        width: '90%',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        paddingHorizontal: 20,
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
        marginVertical: 5,
        borderRadius: 5,
    },
    cityButtonText: {
        fontSize: 16,
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
});

export default WeatherApp;

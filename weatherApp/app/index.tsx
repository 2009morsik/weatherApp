import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import axios from 'axios';

import { useRouter } from 'expo-router';

const API_KEY = '4bab1135e84f88608fc00b3799e2a2e9';

// Добавляем города
const cities = ['Москва', 'Нью-Йорк', 'Лондон', 'Париж', 'Токио', 'Екатеринбург', 'Ханты-Мансийск'];

const getWeatherData = async (city: string) => {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ru`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
};

const WeatherApp = () => {
    const [city, setCity] = useState('Москва'); // Начальный город — Москва
    const [weather, setWeather] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);  // Управление видимостью модального окна
    const router = useRouter();

    useEffect(() => {
        const fetchWeather = async () => {
            const data = await getWeatherData(city);
            setWeather(data);
        };

        fetchWeather();
    }, [city]);

    if (!weather) {
        return <Text>Загрузка...</Text>;
    }

    // Словарь для русских состояний погоды и соответствующих иконок
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
        };

        return weatherImages[weatherCondition.toLowerCase()] || weatherImages['ясно']; // По умолчанию ясное небо
    };

    const handleCitySelect = (selectedCity: string) => {
        setCity(selectedCity);
        setIsModalVisible(false); // Закрыть модальное окно после выбора города
    };

    const temperature = Math.round(weather.main.temp);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Текущая погода в {weather.name}</Text>
            <Text style={styles.temperature}>{temperature}°C</Text>
            <Image
                source={{ uri: getWeatherImage(weather.weather[0].description) }}
                style={styles.weatherIcon}
            />
            <Text style={styles.description}>{weather.weather[0].description}</Text>
            <TouchableOpacity onPress={() => router.push('/forecast')}  style={styles.button}>
                <Text style={styles.buttonText}>
                    Перейти к прогнозу на несколько дней
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}  style={styles.button}>
                <Text style={styles.buttonText}>
                    Выберите город
                </Text>
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
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    temperature: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    weatherIcon: {
        width: 100,
        height: 100,
    },
    description: {
        fontSize: 18,
        color: 'gray',
        marginBottom: 60,
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
    button:{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4A90E2',
        height: 45,
        borderRadius: 20,
        width: "90%",
        marginBottom: 20
    },
    buttonText:{
        color:'black',
        fontSize: 18,
    },
});

export default WeatherApp;

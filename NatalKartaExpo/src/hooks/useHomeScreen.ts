import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import ApiService from '../services/api';
import { User, DailyPrediction, DailyPredictionContent } from '../types';

export const useHomeScreen = (user: User | null) => {
    const [dailyPrediction, setDailyPrediction] = useState<DailyPrediction | null>(null);
    const [loading, setLoading] = useState(false);

    const parsedContent = useMemo(() => {
        if (!dailyPrediction || !dailyPrediction.content) return null;
        if (typeof dailyPrediction.content === 'object')
            return dailyPrediction.content as DailyPredictionContent;
        try {
            return JSON.parse(dailyPrediction.content) as DailyPredictionContent;
        } catch {
            return null;
        }
    }, [dailyPrediction]);

    const loadDailyPrediction = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await ApiService.getDailyPrediction(user.id);
            if (response.data) setDailyPrediction(response.data);
        } catch {
            // Silent error
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) loadDailyPrediction();
    }, [user, loadDailyPrediction]);

    const generateNewPrediction = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await ApiService.generateDailyPrediction(user.id);
            if (response.data) {
                setDailyPrediction(response.data);
            } else {
                Alert.alert('Ошибка', 'Не удалось сгенерировать предсказание');
            }
        } catch {
            Alert.alert('Ошибка', 'Не удалось сгенерировать предсказание');
        } finally {
            setLoading(false);
        }
    }, [user]);

    return { dailyPrediction, parsedContent, loading, loadDailyPrediction, generateNewPrediction };
};

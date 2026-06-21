import { useState, useEffect, useCallback } from 'react';
import { DailyCardService, DailyCardResponse } from '../services/DailyCardService';

export const useDailyCard = (userId?: number) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [dailyCard, setDailyCard] = useState<DailyCardResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDailyCard = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await DailyCardService.getDailyCard(userId);
      if (res.success && res.data) {
        setDailyCard(res.data);
      }
    } catch (err) {
      console.error('Error fetching daily card:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDailyCard();
  }, [fetchDailyCard]);

  const openDailyCard = useCallback(() => {
    if (dailyCard) {
      setModalVisible(true);
    }
  }, [dailyCard]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const revealDailyCard = useCallback(async () => {
    if (!userId || !dailyCard) return;
    try {
      const res = await DailyCardService.revealDailyCard(userId);
      if (res.success && res.data) {
        setDailyCard(res.data);
      }
    } catch (err) {
      console.error('Error revealing daily card:', err);
    }
  }, [userId, dailyCard]);

  return {
    isModalVisible,
    dailyCard,
    isLoading,
    openDailyCard,
    closeModal,
    revealDailyCard,
  };
};

import { useState, useCallback } from 'react';
import { DailyCardService } from '../services/DailyCardService';

export const useDailyCard = (userId?: number) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openDailyCard = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    const res = await DailyCardService.getDailyCard(userId);
    if (res.success && res.data) {
      setSelectedCardId(res.data.tarot_card_id);
      setModalVisible(true);
    }
    setIsLoading(false);
  }, [userId]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  return {
    isModalVisible,
    selectedCardId,
    isLoading,
    openDailyCard,
    closeModal,
  };
};

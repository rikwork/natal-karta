import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { getWebSocketUrl } from '../utils/websocket';

interface UseSubscriptionWithPollingOptions<TData, TResponse> {
  userId: number;
  firebaseUid?: string;
  itemId: number;
  channel: string;
  messageIdKey: string;
  messageDataKey: string;
  fetchData: () => Promise<{ data: TResponse }>;
  initialData: TData | null;
  errorTitle?: string;
  errorMessageDefault?: string;
  onCompleted?: (data: TData, rawResponse: TResponse) => void;
}

export function useSubscriptionWithPolling<TData, TResponse>({
  userId,
  firebaseUid,
  itemId,
  channel,
  messageIdKey,
  messageDataKey,
  fetchData,
  initialData,
  errorTitle = 'Ошибка',
  errorMessageDefault = 'Не удалось загрузить данные',
  onCompleted,
}: UseSubscriptionWithPollingOptions<TData, TResponse>) {
  const [data, setData] = useState<TData | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData);

  // Паттерн "latest ref" для предотвращения перезапуска эффекта при изменении переданных функций
  const fetchDataRef = useRef(fetchData);
  const onCompletedRef = useRef(onCompleted);

  useEffect(() => {
    fetchDataRef.current = fetchData;
    onCompletedRef.current = onCompleted;
  });

  const isSubscribedRef = useRef(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Если данные уже есть, не нужно подписываться
    if (data) {
      setLoading(false);
      return;
    }

    isSubscribedRef.current = true;
    setLoading(true);

    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };

    const startPolling = () => {
      if (pollIntervalRef.current) return;
      console.log(`Falling back to polling for channel ${channel}...`);
      pollIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetchDataRef.current();
          const responseData = response.data as any;
          if (responseData && responseData[messageDataKey] && isSubscribedRef.current) {
            const rawData = responseData[messageDataKey];
            const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
            setData(parsedData);
            setLoading(false);
            if (onCompletedRef.current) {
              onCompletedRef.current(parsedData, response.data);
            }
            stopPolling();
            if (wsRef.current) {
              wsRef.current.close();
            }
          }
        } catch (err) {
          console.error(`Error polling for channel ${channel}:`, err);
        }
      }, 5000);
    };

    const connectWebSocket = () => {
      try {
        const wsUrl = getWebSocketUrl(userId);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isSubscribedRef.current) return;
          const msg = {
            command: 'subscribe',
            identifier: JSON.stringify({
              channel,
              user_id: userId,
              firebase_uid: firebaseUid,
            }),
          };
          ws.send(JSON.stringify(msg));
        };

        ws.onmessage = (event) => {
          if (!isSubscribedRef.current) return;
          try {
            const parsedEvent = JSON.parse(event.data);
            if (parsedEvent.type === 'ping') return;

            const message = parsedEvent.message;
            if (message && message[messageIdKey] === itemId) {
              if (message.status === 'completed') {
                const rawData = message[messageDataKey];
                const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                setData(parsedData);
                setLoading(false);
                if (onCompletedRef.current) {
                  onCompletedRef.current(parsedData, { [messageDataKey]: rawData } as any);
                }
                stopPolling();
                ws.close();
              } else if (message.status === 'failed') {
                Alert.alert(errorTitle, message.error || errorMessageDefault);
                setLoading(false);
                stopPolling();
                ws.close();
              }
            }
          } catch (e) {
            console.error('Error parsing WS message:', e);
          }
        };

        ws.onerror = (e) => {
          console.error(`WebSocket error for ${channel}, falling back to polling:`, e);
          startPolling();
        };

        ws.onclose = () => {
          console.log(`WebSocket closed for ${channel}, starting polling fallback if loading`);
          if (isSubscribedRef.current) {
            startPolling();
          }
        };
      } catch (err) {
        console.error(`WebSocket connection failed for ${channel}, falling back to polling:`, err);
        startPolling();
      }
    };

    const checkStatus = async () => {
      try {
        const response = await fetchDataRef.current();
        const responseData = response.data as any;
        if (responseData && responseData[messageDataKey] && isSubscribedRef.current) {
          const rawData = responseData[messageDataKey];
          const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
          setData(parsedData);
          setLoading(false);
          if (onCompletedRef.current) {
            onCompletedRef.current(parsedData, response.data);
          }
        } else {
          connectWebSocket();
        }
      } catch (err) {
        console.error(`Error checking status for ${channel}:`, err);
        connectWebSocket();
      }
    };

    checkStatus();

    return () => {
      isSubscribedRef.current = false;
      stopPolling();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    itemId,
    userId,
    firebaseUid,
    channel,
    messageIdKey,
    messageDataKey,
    errorTitle,
    errorMessageDefault,
  ]);

  return { data, loading, setData };
}

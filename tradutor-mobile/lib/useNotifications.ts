import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuração de como as notificações devem ser exibidas quando o app está em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const sendNotification = async (title: string, body: string) => {
    if (Platform.OS === 'web') {
      // No web, não enviamos notificação local
      console.log('Notificação (web):', title, body);
      return;
    }

    try {
      // Solicita permissão apenas quando for enviar
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Permissão de notificação negada');
        return;
      }

      // Configuração do canal de notificação para Android (apenas se necessário)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Traduções',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      // Envia a notificação local
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // null = imediatamente
      });
    } catch (error) {
      console.log('Erro ao enviar notificação:', error);
    }
  };

  return { sendNotification };
}

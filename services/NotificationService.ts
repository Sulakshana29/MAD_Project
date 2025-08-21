import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleLocalNotification(title: string, body: string): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      
      if (!hasPermission) {
        console.log('Notification permission not granted');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async showIncomingMessageNotification(senderName: string, message: string): Promise<void> {
    await this.scheduleLocalNotification(
      `New message from ${senderName}`,
      message.length > 50 ? message.substring(0, 50) + '...' : message
    );
  }

  async showConnectionNotification(type: 'connected' | 'disconnected', partnerName?: string): Promise<void> {
    if (type === 'connected' && partnerName) {
      await this.scheduleLocalNotification(
        'Connected to Chat',
        `You are now connected with ${partnerName}`
      );
    } else if (type === 'disconnected') {
      await this.scheduleLocalNotification(
        'Chat Disconnected',
        'You have been disconnected from the chat session'
      );
    }
  }

  async showQRCodeGeneratedNotification(): Promise<void> {
    await this.scheduleLocalNotification(
      'QR Code Generated',
      'Your QR code is ready to be scanned!'
    );
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }
}

export default new NotificationService();

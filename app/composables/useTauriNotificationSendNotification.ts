import { sendNotification } from '@tauri-apps/plugin-notification';

interface NotificationOptions {
  title: string;
  body?: string;
}

export function useTauriNotificationSendNotification(options: NotificationOptions) {
  return sendNotification({
    title: options.title,
    body: options.body || '',
  });
} 
import webpush from 'web-push';
import { prisma } from './db';

// Configure web-push
webpush.setVapidDetails(
  'mailto:noreply@guvenli-sur.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  actions?: { action: string; title: string }[];
}

export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            JSON.stringify(payload)
          );
          return { success: true, endpoint: sub.endpoint };
        } catch (error: any) {
          // If subscription is invalid, remove it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { id: sub.id },
            }).catch(() => {});
          }
          return { success: false, endpoint: sub.endpoint, error };
        }
      })
    );

    return results;
  } catch (error) {
    console.error('Push notification error:', error);
    return [];
  }
}

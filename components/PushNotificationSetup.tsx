'use client'

import { usePushNotifications } from '@/hooks/usePushNotifications'

// Mounts once at layout level — registers for push on native, no-ops on web.
export default function PushNotificationSetup() {
  usePushNotifications()
  return null
}

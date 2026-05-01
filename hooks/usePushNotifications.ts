import { useEffect } from 'react'

// Only activates inside the Capacitor native shell — no-ops on web.
export function usePushNotifications() {
  useEffect(() => {
    async function init() {
      if (typeof window === 'undefined') return

      const { Capacitor } = await import('@capacitor/core')
      if (!Capacitor.isNativePlatform()) return

      const { PushNotifications } = await import('@capacitor/push-notifications')

      const perm = await PushNotifications.requestPermissions()
      if (perm.receive !== 'granted') return

      await PushNotifications.register()

      PushNotifications.addListener('registration', token => {
        // TODO: store token in Supabase profiles table so you can target users
        console.log('APNs token:', token.value)
      })

      PushNotifications.addListener('registrationError', err => {
        console.error('Push registration failed:', err)
      })

      // Notification arrives while app is open
      PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('Push received in foreground:', notification)
      })

      // User taps the notification
      PushNotifications.addListener('pushNotificationActionPerformed', action => {
        const url = action.notification.data?.url
        if (url) window.location.href = url
      })
    }

    init()
  }, [])
}

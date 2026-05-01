// Wraps Capacitor Haptics with safe no-ops on web.
// Lazy import so it doesn't bloat the web bundle.

export async function hapticTap() {
  try {
    if (typeof window === 'undefined') return
    const { Capacitor } = await import('@capacitor/core')
    if (!Capacitor.isNativePlatform()) return
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    // never let haptics break a UX flow
  }
}

export async function hapticSuccess() {
  try {
    if (typeof window === 'undefined') return
    const { Capacitor } = await import('@capacitor/core')
    if (!Capacitor.isNativePlatform()) return
    const { Haptics, NotificationType } = await import('@capacitor/haptics')
    await Haptics.notification({ type: NotificationType.Success })
  } catch {}
}

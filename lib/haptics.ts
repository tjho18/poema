// Wraps Capacitor Haptics with safe no-ops on web.
// Lazy import so it doesn't bloat the web bundle.

async function native() {
  if (typeof window === 'undefined') return null
  const { Capacitor } = await import('@capacitor/core')
  if (!Capacitor.isNativePlatform()) return null
  const mod = await import('@capacitor/haptics')
  return mod
}

/** Lightest tick — used for poem-to-poem swipe (selection feedback) */
export async function hapticSelection() {
  try {
    const mod = await native()
    if (!mod) return
    await mod.Haptics.selectionStart()
    await mod.Haptics.selectionChanged()
    await mod.Haptics.selectionEnd()
  } catch {}
}

/** Light impact — used for long-press initiation */
export async function hapticTap() {
  try {
    const mod = await native()
    if (!mod) return
    await mod.Haptics.impact({ style: mod.ImpactStyle.Light })
  } catch {}
}

/** Medium impact — used for sheet open/close */
export async function hapticMedium() {
  try {
    const mod = await native()
    if (!mod) return
    await mod.Haptics.impact({ style: mod.ImpactStyle.Medium })
  } catch {}
}

/** Success notification — used after save */
export async function hapticSuccess() {
  try {
    const mod = await native()
    if (!mod) return
    await mod.Haptics.notification({ type: mod.NotificationType.Success })
  } catch {}
}

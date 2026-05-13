import { registerSW } from 'virtual:pwa-register'

/** Dispatched on `window` when a new service worker is waiting (see `PwaUpdateBanner`). */
export const PWA_NEED_REFRESH_EVENT = 'wordssky-pwa-need-refresh'

let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined

/** Call once at startup (e.g. from `main.tsx`). */
export function registerPwaServiceWorker(): void {
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      window.dispatchEvent(new CustomEvent(PWA_NEED_REFRESH_EVENT))
    },
  })
}

/** Activates the waiting worker and reloads the page (vite-plugin-pwa `registerType: 'autoUpdate'`). */
export function activateWaitingServiceWorker(): Promise<void> | undefined {
  return updateSW?.(true)
}

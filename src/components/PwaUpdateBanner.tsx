import { useEffect, useState } from 'react'
import { activateWaitingServiceWorker, PWA_NEED_REFRESH_EVENT } from '../lib/pwaRegister'
import { strings } from '../lib/strings'

export function PwaUpdateBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onNeed = () => setVisible(true)
    window.addEventListener(PWA_NEED_REFRESH_EVENT, onNeed)
    return () => window.removeEventListener(PWA_NEED_REFRESH_EVENT, onNeed)
  }, [])

  if (!visible) return null

  return (
    <div className="pwa-update-banner" role="status">
      <p className="pwa-update-banner-text">{strings.app.updateReady}</p>
      <div className="pwa-update-banner-actions">
        <button
          type="button"
          className="pwa-update-banner-dismiss"
          onClick={() => setVisible(false)}
        >
          {strings.app.updateLater}
        </button>
        <button
          type="button"
          className="pwa-update-banner-reload"
          onClick={() => {
            void activateWaitingServiceWorker()
          }}
        >
          {strings.app.updateReload}
        </button>
      </div>
    </div>
  )
}

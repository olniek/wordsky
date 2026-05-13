import { useEffect, useState } from 'react'
import { strings } from '../lib/strings'
import {
  STORAGE_WRITE_FAILED_EVENT,
  STORAGE_WRITE_RECOVERED_EVENT,
  isStorageBroken,
} from '../lib/storage'

export function StorageIssueBanner() {
  const [broken, setBroken] = useState(isStorageBroken)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  useEffect(() => {
    const onFail = () => setBroken(true)
    const onRecover = () => {
      setBroken(false)
      setBannerDismissed(false)
    }
    window.addEventListener(STORAGE_WRITE_FAILED_EVENT, onFail)
    window.addEventListener(STORAGE_WRITE_RECOVERED_EVENT, onRecover)
    return () => {
      window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, onFail)
      window.removeEventListener(STORAGE_WRITE_RECOVERED_EVENT, onRecover)
    }
  }, [])

  if (!broken) return null

  if (bannerDismissed) {
    return (
      <div
        className="storage-issue-chip"
        role="status"
        aria-label={strings.app.storageChipAriaLabel}
      >
        <span className="storage-issue-chip-glyph" aria-hidden="true">!</span>
      </div>
    )
  }

  return (
    <div className="storage-issue-banner" role="status">
      <p className="storage-issue-banner-text">{strings.app.storageWarning}</p>
      <button
        type="button"
        className="storage-issue-banner-dismiss"
        onClick={() => setBannerDismissed(true)}
      >
        {strings.app.storageDismiss}
      </button>
    </div>
  )
}

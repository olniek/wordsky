import { Navigate, Route, Routes } from 'react-router-dom'
import { PwaUpdateBanner } from './components/PwaUpdateBanner'
import { StorageIssueBanner } from './components/StorageIssueBanner'
import TopicLanding from './components/TopicLanding'
import TopicPage from './components/TopicPage'

function App() {
  return (
    <>
      <PwaUpdateBanner />
      <StorageIssueBanner />
      <Routes>
        <Route path="/" element={<TopicLanding />} />
        <Route path="/topic/:slug" element={<TopicPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App

import { Navigate, Route, Routes } from 'react-router-dom'
import { PwaUpdateBanner } from './components/PwaUpdateBanner'
import { StorageIssueBanner } from './components/StorageIssueBanner'
import RecognitionReport from './components/RecognitionReport'
import TopicLanding from './components/TopicLanding'
import TopicPage from './components/TopicPage'
import WelcomeLanding from './components/WelcomeLanding'

function App() {
  return (
    <>
      <PwaUpdateBanner />
      <StorageIssueBanner />
      <Routes>
        <Route path="/" element={<WelcomeLanding />} />
        <Route path="/topics" element={<TopicLanding />} />
        <Route path="/topic/:slug" element={<TopicPage />} />
        <Route path="/recognize/:target" element={<RecognitionReport />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App

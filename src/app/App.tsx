import { Navigate, Route, Routes } from 'react-router-dom'
import { PwaUpdateBanner } from '../components/shell/PwaUpdateBanner'
import { StorageIssueBanner } from '../components/shell/StorageIssueBanner'
import RecognitionReport from '../components/recognition/RecognitionReport'
import TopicLanding from '../components/topic-hub/TopicLanding'
import TopicPage from '../components/topic/TopicPage'
import WelcomeLanding from '../components/welcome/WelcomeLanding'

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

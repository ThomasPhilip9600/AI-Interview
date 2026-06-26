import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Categories from './pages/Categories';
import InterviewDetails from './pages/InterviewDetails';
import Setup from './pages/Setup';
import PostureCheck from './pages/PostureCheck';
import QuestionDisplay from './pages/QuestionDisplay';
import Recording from './pages/Recording';
import Processing from './pages/Processing';
import Report from './pages/Report';
import History from './pages/History';

function App() {
  return (
    <Router basename="/ai-interview">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="categories" element={<Categories />} />
          <Route path="interview/:id" element={<InterviewDetails />} />
          <Route path="interview/:id/setup" element={<Setup />} />
          <Route path="interview/:id/posture" element={<PostureCheck />} />
          <Route path="attempt/:attemptId/question/:index" element={<QuestionDisplay />} />
          <Route path="attempt/:attemptId/record/:index" element={<Recording />} />
          <Route path="attempt/:attemptId/processing" element={<Processing />} />
          <Route path="attempt/:attemptId/report" element={<Report />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

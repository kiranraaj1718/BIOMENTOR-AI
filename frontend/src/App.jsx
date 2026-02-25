import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';
import LearningPathPage from './pages/LearningPathPage';
import ReportPage from './pages/ReportPage';
import LibraryPage from './pages/LibraryPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ExamPredictorPage from './pages/ExamPredictorPage';
import DiagramCreatorPage from './pages/DiagramCreatorPage';
import MistakeAnalyzerPage from './pages/MistakeAnalyzerPage';
import RevisionModePage from './pages/RevisionModePage';
import StudyRoadmapPage from './pages/StudyRoadmapPage';

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/learning-path" element={<LearningPathPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/exam-predictor" element={<ExamPredictorPage />} />
        <Route path="/diagram" element={<DiagramCreatorPage />} />
        <Route path="/mistakes" element={<MistakeAnalyzerPage />} />
        <Route path="/revision" element={<RevisionModePage />} />
        <Route path="/roadmap" element={<StudyRoadmapPage />} />
      </Route>
    </Routes>
  );
}

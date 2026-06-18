import React from 'react';
import Dashboard from './components/dashboard/Dashboard';
import InterviewDetails from './components/dashboard/InterviewDetails';
import SetupHardware from './components/interview/SetupHardware';
import PostureCheck from './components/interview/PostureCheck';
import QuestionDisplay from './components/interview/QuestionDisplay';
import RecordingScreen from './components/interview/RecordingScreen';
import UploadingScreen from './components/interview/UploadingScreen';
import FinalReport from './components/results/FinalReport';
import { apiService } from './services/apiService';
import { mediaService } from './services/mediaService';
import { GraduationCap } from 'lucide-react';

export default function App() {
  // Navigation / screen routing states:
  // 'dashboard' | 'details' | 'setup' | 'calibration' | 'prep' | 'recording' | 'uploading' | 'report'
  const [view, setView] = React.useState('dashboard');
  
  // Data States
  const [questions, setQuestions] = React.useState([]);
  const [history, setHistory] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [activeAttemptId, setActiveAttemptId] = React.useState(null);
  const [activeStream, setActiveStream] = React.useState(null);
  const [initialPostureData, setInitialPostureData] = React.useState(null);
  const [reportData, setReportData] = React.useState(null);
  
  // Question loop state
  const [currentQuestionsList, setCurrentQuestionsList] = React.useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  
  // Processing Pipeline States
  const [uploadStage, setUploadStage] = React.useState(1);
  const [apiError, setApiError] = React.useState('');

  // Initial Load: Fetch questions & history
  const loadData = async () => {
    try {
      const qData = await apiService.getQuestions();
      setQuestions(qData);
      
      const histData = await apiService.getHistory();
      setHistory(histData);
    } catch (err) {
      console.error('App: Failed to load startup data:', err);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleSelectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
    setView('details');
  };

  const handleStartInterview = async () => {
    try {
      setApiError('');
      // Filter questions for this category
      const categoryQuestions = questions.filter(q => q.category === selectedCategory);
      if (categoryQuestions.length === 0) {
        alert('No questions available in this category.');
        return;
      }

      setCurrentQuestionsList(categoryQuestions);
      setCurrentQuestionIndex(0);

      // Call API to create a new attempt record
      const attemptRes = await apiService.startAttempt(selectedCategory, 'student@portfolix.ai');
      setActiveAttemptId(attemptRes.attemptId);
      
      // Proceed to Setup Hardware
      setView('setup');
    } catch (err) {
      console.error('App: Error starting interview attempt:', err);
      setApiError('Could not connect to server to start attempt. Please verify backend is running.');
    }
  };

  const handleHardwareConfigured = (stream) => {
    setActiveStream(stream);
    setView('calibration');
  };

  const handleCalibrationPassed = (postureData) => {
    setInitialPostureData(postureData);
    setView('prep');
  };

  const handleStartRecording = () => {
    setView('recording');
  };

  const handleRecordingCompleted = async (videoBlob, postureData) => {
    // Show uploading screen
    setView('uploading');
    setUploadStage(1);

    const question = currentQuestionsList[currentQuestionIndex];

    try {
      // Simulate pipeline stages for the user since processing uploads is fast locally
      const timer1 = setTimeout(() => setUploadStage(2), 1000);
      const timer2 = setTimeout(() => setUploadStage(3), 2000);
      const timer3 = setTimeout(() => setUploadStage(4), 3000);

      // Send files and post data to backend
      const evaluationResponse = await apiService.submitAnswer(
        activeAttemptId,
        question.id,
        videoBlob,
        postureData
      );

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      console.log('App: Answer evaluated successfully.', evaluationResponse);

      // Determine next steps in interview loop
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < currentQuestionsList.length) {
        // Go to prep for next question
        setCurrentQuestionIndex(nextIndex);
        setView('prep');
      } else {
        // Finalize Attempt
        setUploadStage(4);
        await apiService.completeAttempt(activeAttemptId);
        
        // Fetch attempt report and load report screen
        const report = await apiService.getReport(activeAttemptId);
        setReportData(report);
        
        // Stop the webcam track stream safely
        if (activeStream) {
          mediaService.stopStream(activeStream);
          setActiveStream(null);
        }

        setView('report');
      }

    } catch (err) {
      console.error('App: Submission failed:', err);
      alert('Answer upload and analysis failed. Please verify server connection and try again.');
      setView('recording'); // Fall back to allow retry
    }
  };

  const handleViewReport = async (attemptId) => {
    try {
      const report = await apiService.getReport(attemptId);
      setReportData(report);
      setView('report');
    } catch (err) {
      console.error('App: Failed to retrieve report details:', err);
      alert('Failed to load assessment report.');
    }
  };

  const handleBackToDashboard = () => {
    // Stop streams if active
    if (activeStream) {
      mediaService.stopStream(activeStream);
      setActiveStream(null);
    }
    
    // Refresh history
    loadData();
    
    // Clear state
    setSelectedCategory('');
    setActiveAttemptId(null);
    setInitialPostureData(null);
    setReportData(null);
    setCurrentQuestionsList([]);
    setCurrentQuestionIndex(0);

    setView('dashboard');
  };

  return (
    <div className="app-shell">
      {/* Top Application Navbar */}
      <header className="app-header glass-card">
        <div className="header-brand clickable" onClick={handleBackToDashboard}>
          <GraduationCap className="brand-logo text-violet-400" size={24} />
          <span className="brand-name">Portfolix <span className="text-violet-400">AI</span></span>
        </div>
        <div className="header-user">
          <div className="user-avatar">DS</div>
          <span className="user-name">student@portfolix.ai</span>
        </div>
      </header>

      {/* Main Container Render Routing */}
      <main className="app-main">
        {view === 'dashboard' && (
          <Dashboard 
            questions={questions}
            history={history}
            onSelectCategory={handleSelectCategory}
            onViewReport={handleViewReport}
          />
        )}

        {view === 'details' && (
          <InterviewDetails
            category={selectedCategory}
            questions={questions}
            onBack={handleBackToDashboard}
            onStartInterview={handleStartInterview}
          />
        )}

        {view === 'setup' && (
          <SetupHardware
            onPermissionGranted={handleHardwareConfigured}
            onCancel={handleBackToDashboard}
          />
        )}

        {view === 'calibration' && (
          <PostureCheck
            stream={activeStream}
            onCalibrationPassed={handleCalibrationPassed}
            onBack={handleBackToDashboard}
          />
        )}

        {view === 'prep' && (
          <QuestionDisplay
            question={currentQuestionsList[currentQuestionIndex]}
            currentIndex={currentQuestionIndex}
            totalQuestions={currentQuestionsList.length}
            onStartRecording={handleStartRecording}
          />
        )}

        {view === 'recording' && (
          <RecordingScreen
            stream={activeStream}
            question={currentQuestionsList[currentQuestionIndex]}
            currentIndex={currentQuestionIndex}
            totalQuestions={currentQuestionsList.length}
            onRecordingCompleted={handleRecordingCompleted}
          />
        )}

        {view === 'uploading' && (
          <UploadingScreen currentStage={uploadStage} />
        )}

        {view === 'report' && reportData && (
          <FinalReport
            reportData={reportData}
            onBack={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
}

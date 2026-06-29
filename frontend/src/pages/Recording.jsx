import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useMediaRecorder from '../hooks/useMediaRecorder';
import api from '../services/api';
import usePostureDetector from '../hooks/usePostureDetector';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { Square, AlertTriangle } from 'lucide-react';

export default function Recording() {
  const { attemptId, index } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const { mediaStream, startCamera, stopCamera, startRecording, stopRecording, isRecording, recordedBlob, hasSpoken } = useMediaRecorder();
  const postureState = usePostureDetector(videoRef);
  const { transcript } = useSpeechRecognition(isRecording);
  
  const [timeLeft, setTimeLeft] = useState(60); 
  const [initialTimeLimit, setInitialTimeLimit] = useState(60);
  const [uploading, setUploading] = useState(false);
  const [questionId, setQuestionId] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(1);
  const [isSelfIntro, setIsSelfIntro] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(1);

  useEffect(() => {
    let isMounted = true;
    // Fetch attempt details to get the real question ID
    api.get(`/ai-interviews/attempts/${attemptId}`)
      .then(res => {
        if (!isMounted) return;
        const questions = res.data.questions;
        const qIndex = parseInt(index);
        setTotalQuestions(questions.length);
        if (questions && questions.length > qIndex) {
          setQuestionId(questions[qIndex].id);
          const limit = questions[qIndex].answer_time_limit || 60;
          setTimeLeft(limit);
          setInitialTimeLimit(limit);
          
          setIsSelfIntro(questions[qIndex].id === 'self-intro');
          const offset = questions[0]?.id === 'self-intro' ? 0 : 1;
          setDisplayNumber(parseInt(index) + offset);
        }
      })
      .catch(console.error);

    startCamera().then(stream => {
      if (stream && isMounted) {
        startRecording(stream);
      }
    });

    return () => {
      isMounted = false;
      stopRecording();
      stopCamera();
    };
  }, [attemptId, index]);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  useEffect(() => {
    let timer;
    if (isRecording && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (isRecording && timeLeft === 0) {
      handleStop();
    }
    return () => clearTimeout(timer);
  }, [isRecording, timeLeft]);

  useEffect(() => {
    if (recordedBlob && !uploading) {
      uploadVideo(recordedBlob);
    }
  }, [recordedBlob]);

  const handleStop = () => {
    stopRecording();
    stopCamera();
  };

  const uploadVideo = async (blob) => {
    if (!questionId) {
      alert('Error: Question ID not loaded. Please refresh the page.');
      return;
    }
    
    setUploading(true);
    
    // Retrieve behavioral metrics from frontend AI
    const metrics = postureState.getAggregatedMetrics ? postureState.getAggregatedMetrics() : {};
    
    const formData = new FormData();
    formData.append('video', blob, `answer_${index}.mp4`);
    formData.append('questionId', questionId);
    formData.append('durationSec', initialTimeLimit - timeLeft);
    formData.append('hasSpoken', hasSpoken);
    formData.append('behavioralMetrics', JSON.stringify(metrics));
    formData.append('frontendTranscript', transcript);

    try {
      const res = await api.post(`/ai-interviews/attempts/${attemptId}/answers`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { answerId } = res.data;
      // Trigger AI evaluation in background
      api.post(`/ai-interviews/answers/${answerId}/evaluate`).catch(e => console.error(e));

      const nextIndex = parseInt(index) + 1;
      if (nextIndex < totalQuestions) {
        navigate(`/attempt/${attemptId}/question/${nextIndex}`);
      } else {
        navigate(`/attempt/${attemptId}/processing`);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in flex flex-col items-center">
      <div className="flex justify-between w-full max-w-4xl mb-4">
        <h3 className="text-secondary text-sm">
          {isSelfIntro ? 'Self Introduction' : `Question ${displayNumber}`}
        </h3>
        <div className="flex items-center gap-2 text-danger">
          <div className="recording-dot"></div>
          <span style={{ fontWeight: 600 }}>00:{timeLeft.toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div className="video-container" style={{ maxWidth: '800px', height: '450px', border: '2px solid var(--danger)' }}>
        {mediaStream && <video ref={videoRef} autoPlay muted playsInline />}
        
        {postureState.errorMessage && !uploading && postureState.ready && (
          <div className="camera-overlay" style={{ pointerEvents: 'none', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '1.5rem', boxSizing: 'border-box' }}>
            {/* Top Warning (Gaze/Eye Contact) - Floating Orange Badge */}
            {postureState.errorMessage.toLowerCase().includes('contact') || postureState.errorMessage.toLowerCase().includes('eye') ? (
              <div className="flex items-center gap-2 px-4 py-2.5 mx-auto rounded-xl shadow-lg animate-fade-in" style={{ background: '#f97316', border: '1px solid #ea580c', color: 'white', fontWeight: 600, fontSize: '0.9rem', pointerEvents: 'auto' }}>
                <AlertTriangle size={16} /> Last warning! Keep eyes on screen.
              </div>
            ) : <div />}

            {/* Bottom Warning (Alignment/Centering/Shoulders) - Floating Dark Badge */}
            {!(postureState.errorMessage.toLowerCase().includes('contact') || postureState.errorMessage.toLowerCase().includes('eye')) ? (
              <div className="flex items-center gap-2 px-4 py-2.5 mx-auto rounded-xl shadow-lg animate-fade-in" style={{ background: 'rgba(20, 21, 24, 0.85)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontWeight: 600, fontSize: '0.9rem', pointerEvents: 'auto', backdropFilter: 'blur(4px)' }}>
                <span role="img" aria-label="camera">📷</span> {postureState.errorMessage}
              </div>
            ) : <div />}
          </div>
        )}
        
        {uploading && (
          <div className="camera-overlay justify-center items-center glass-panel" style={{ borderRadius: 0 }}>
            <h3 className="text-xl mb-2">Compressing & Uploading...</h3>
            <div className="progress-bg mt-4" style={{ width: '200px' }}>
              <div className="progress-fill" style={{ width: '60%', animation: 'pulse 1s infinite' }}></div>
            </div>
          </div>
        )}
      </div>
      


      <button 
        className="btn btn-danger mt-8" 
        style={{ padding: '16px 32px' }}
        onClick={handleStop}
        disabled={uploading}
      >
        <Square size={20} fill="currentColor" />
        Stop Recording
      </button>
    </div>
  );
}

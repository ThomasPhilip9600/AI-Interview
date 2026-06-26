import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useMediaRecorder from '../hooks/useMediaRecorder';
import { ScanFace, UserCheck, CheckCircle } from 'lucide-react';

export default function PostureCheck() {
  const { id } = useParams(); // attemptId
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { mediaStream, startCamera, stopCamera } = useMediaRecorder();
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    startCamera();
    
    // Simulate AI posture analysis delay
    const timer = setTimeout(() => {
      setAnalyzing(false);
    }, 3000);

    return () => {
      stopCamera();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
    <div className="animate-fade-in flex flex-col items-center">
      <h2 className="text-2xl mb-2">Posture & Environment Check</h2>
      <p className="text-sm mb-6">Let's make sure your environment is ideal for the interview.</p>

      <div className="card w-full" style={{ maxWidth: '800px', display: 'flex', gap: '2rem' }}>
        <div className="video-container" style={{ flex: 1, height: '300px' }}>
          {mediaStream && <video ref={videoRef} autoPlay muted playsInline />}
          {analyzing && (
            <div className="camera-overlay justify-center items-center">
              <ScanFace size={64} color="var(--accent-primary)" className="recording-dot" style={{ background: 'transparent' }} />
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'col', justifyContent: 'center' }}>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between p-3" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span className="flex items-center gap-2"><UserCheck size={18} /> Face Centered</span>
              {analyzing ? <span className="text-sm">Analyzing...</span> : <CheckCircle color="var(--success)" size={18} />}
            </div>
            <div className="flex items-center justify-between p-3" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span className="flex items-center gap-2"><UserCheck size={18} /> Shoulders Visible</span>
              {analyzing ? <span className="text-sm">Analyzing...</span> : <CheckCircle color="var(--success)" size={18} />}
            </div>
            <div className="flex items-center justify-between p-3" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span className="flex items-center gap-2"><UserCheck size={18} /> Lighting Adequate</span>
              {analyzing ? <span className="text-sm">Analyzing...</span> : <CheckCircle color="var(--success)" size={18} />}
            </div>

            <button 
              disabled={analyzing}
              className="btn btn-primary w-full mt-4"
              onClick={() => navigate(`/attempt/${id}/question/0`)}
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

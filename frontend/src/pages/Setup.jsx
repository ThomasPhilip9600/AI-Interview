import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useMediaRecorder from '../hooks/useMediaRecorder';
import { Video, Mic, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Setup() {
  const { id } = useParams(); // actually attemptId, but mapped as :id in route /interview/:id/setup
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { mediaStream, startCamera, stopCamera, error } = useMediaRecorder();
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
    <div className="animate-fade-in flex flex-col items-center">
      <h2 className="text-2xl mb-2">Camera & Mic Setup</h2>
      <p className="text-sm mb-6">Ensure you are clearly visible and audible.</p>

      <div className="card w-full flex flex-col items-center" style={{ maxWidth: '600px' }}>
        <div className="video-container mb-6" style={{ height: '300px' }}>
          {mediaStream ? (
            <video ref={videoRef} autoPlay muted playsInline />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full" style={{ background: '#111' }}>
              <AlertTriangle size={32} color="var(--warning)" className="mb-2" />
              <span>{error || 'Requesting camera access...'}</span>
            </div>
          )}
        </div>

        <div className="flex w-full justify-between mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} color={mediaStream ? 'var(--success)' : 'var(--text-secondary)'} />
            <span>Camera Active</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={20} color={mediaStream ? 'var(--success)' : 'var(--text-secondary)'} />
            <span>Microphone Active</span>
          </div>
        </div>

        <div className="w-full p-4 mb-6" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={consent} 
              onChange={(e) => setConsent(e.target.checked)} 
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
            />
            <span className="text-sm">I consent to my webcam video and microphone audio being recorded and processed by AI for interview evaluation.</span>
          </label>
        </div>

        <button 
          disabled={!mediaStream || !consent}
          className="btn btn-primary w-full"
          onClick={() => navigate(`/interview/${id}/posture`)}
        >
          Next: Posture Check
        </button>
      </div>
    </div>
  );
}

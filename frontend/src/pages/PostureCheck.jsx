import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useMediaRecorder from '../hooks/useMediaRecorder';
import usePostureDetector from '../hooks/usePostureDetector';
import { ScanFace, UserCheck, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PostureCheck() {
  const { id } = useParams(); // attemptId
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const { mediaStream, startCamera, stopCamera } = useMediaRecorder();
  // Pass the videoRef to our AI detector hook
  const postureState = usePostureDetector(videoRef);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  // Determine UI state from postureState
  const analyzing = !postureState.ready;
  const isCentered = postureState.isCentered;
  const isProperDistance = postureState.isProperDistance;
  const onlyOnePerson = postureState.faceCount === 1;

  // Final check: all criteria must be met
  const isValid = postureState.isValid;

  return (
    <div className="animate-fade-in flex flex-col items-center">
      <h2 className="text-2xl mb-2">Posture & Environment Check</h2>
      <p className="text-sm mb-6">Let's make sure your environment is ideal for the interview.</p>

      {postureState.errorMessage && !analyzing && (
        <div className="mb-4 p-3 flex items-center justify-center gap-2" style={{ background: 'rgba(255, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', width: '100%', maxWidth: '800px', fontWeight: 600 }}>
          <AlertTriangle size={20} />
          {postureState.errorMessage}
        </div>
      )}

      <div className="card w-full" style={{ maxWidth: '800px', display: 'flex', gap: '2rem' }}>
        <div className="video-container" style={{ flex: 1, height: '300px' }}>
          <video ref={videoRef} autoPlay muted playsInline />
          {analyzing && (
            <div className="camera-overlay justify-center items-center">
              <ScanFace size={64} color="var(--accent-primary)" className="recording-dot" style={{ background: 'transparent' }} />
              <span className="mt-4 font-bold" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>Loading AI Models...</span>
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between p-3" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span className="flex items-center gap-2"><UserCheck size={18} /> Face Centered</span>
              {analyzing ? <span className="text-sm text-secondary">Analyzing...</span> : (isCentered ? <CheckCircle color="var(--success)" size={18} /> : <AlertTriangle color="var(--danger)" size={18} />)}
            </div>
            <div className="flex items-center justify-between p-3" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span className="flex items-center gap-2"><UserCheck size={18} /> Distance & Shoulders</span>
              {analyzing ? <span className="text-sm text-secondary">Analyzing...</span> : (isProperDistance ? <CheckCircle color="var(--success)" size={18} /> : <AlertTriangle color="var(--danger)" size={18} />)}
            </div>
            <div className="flex items-center justify-between p-3" style={{ background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span className="flex items-center gap-2"><UserCheck size={18} /> One Person Only</span>
              {analyzing ? <span className="text-sm text-secondary">Analyzing...</span> : (onlyOnePerson ? <CheckCircle color="var(--success)" size={18} /> : <AlertTriangle color="var(--danger)" size={18} />)}
            </div>

            <button 
              disabled={analyzing || !isValid}
              className="btn btn-primary w-full mt-4"
              onClick={() => navigate(`/attempt/${id}/question/0`)}
              style={(!isValid && !analyzing) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

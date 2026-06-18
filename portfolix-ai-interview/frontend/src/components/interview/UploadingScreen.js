import React from 'react';
import { Loader2, CloudUpload, Music, MessageSquare, BrainCircuit, CheckCircle2 } from 'lucide-react';

export default function UploadingScreen({ currentStage = 1 }) {
  const stages = [
    { id: 1, label: 'Uploading WebM recording to cloud storage', icon: CloudUpload },
    { id: 2, label: 'Isolating audio track via FFmpeg conversion', icon: Music },
    { id: 3, label: 'Transcribing speech to text via Whisper API', icon: MessageSquare },
    { id: 4, label: 'Evaluating response against placement rubrics', icon: BrainCircuit }
  ];

  return (
    <div className="processing-container">
      <div className="glass-card processing-card text-center">
        
        {/* Animated Loader */}
        <div className="processing-loader-wrapper mb-6">
          <div className="loader-outer-circle">
            <div className="loader-inner-circle">
              <BrainCircuit size={48} className="text-violet-400 animate-pulse" />
            </div>
            <div className="spinner-border"></div>
          </div>
        </div>

        <h2 className="processing-title">Analyzing Response</h2>
        <p className="processing-subtitle">
          Please wait. The AI evaluator is analyzing your visual, vocal, and conceptual feedback.
        </p>

        {/* Processing Steps Pipeline */}
        <div className="pipeline-steps glass-card">
          {stages.map((stg) => {
            const IconComponent = stg.icon;
            let statusClass = 'pending'; // pending, active, completed
            
            if (stg.id < currentStage) statusClass = 'completed';
            else if (stg.id === currentStage) statusClass = 'active';

            return (
              <div key={stg.id} className={`pipeline-row ${statusClass}`}>
                <div className="pipeline-icon-wrapper">
                  {statusClass === 'completed' ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : statusClass === 'active' ? (
                    <Loader2 size={16} className="text-violet-400 animate-spin" />
                  ) : (
                    <IconComponent size={16} className="text-slate-600" />
                  )}
                </div>
                <span className="pipeline-label">{stg.label}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

CREATE TABLE IF NOT EXISTS posture_reports (
  id                        CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  answer_id                 CHAR(36)    NOT NULL UNIQUE,
  face_centered_score       INT         NOT NULL,
  eye_contact_score         INT         NOT NULL,
  shoulder_alignment_score  INT         NOT NULL,
  head_straight_score       INT         NOT NULL,
  distance_score            INT         NOT NULL,
  stability_score           INT         NOT NULL,
  final_posture_score       INT         NOT NULL,
  FOREIGN KEY (answer_id) REFERENCES interview_answers(id) ON DELETE CASCADE
);

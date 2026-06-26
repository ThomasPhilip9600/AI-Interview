CREATE TABLE IF NOT EXISTS speech_reports (
  id                    CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  answer_id             CHAR(36)    NOT NULL UNIQUE,
  words_per_minute      FLOAT       NOT NULL,
  filler_word_count     INT         NOT NULL,
  filler_word_breakdown JSON        NOT NULL,
  repeated_words        JSON,
  long_pause_count      INT         NOT NULL,
  pitch_variation       FLOAT,
  speech_rate_score     INT         NOT NULL,
  filler_score          INT         NOT NULL,
  final_speech_score    INT         NOT NULL,
  FOREIGN KEY (answer_id) REFERENCES interview_answers(id) ON DELETE CASCADE
);

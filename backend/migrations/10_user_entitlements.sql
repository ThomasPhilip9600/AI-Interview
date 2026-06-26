CREATE TABLE IF NOT EXISTS user_entitlements (
  id                      CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  user_id                 CHAR(36)    NOT NULL UNIQUE,
  free_attempts_used      INT         NOT NULL DEFAULT 0,
  free_attempts_limit     INT         NOT NULL DEFAULT 1,
  paid_credits            INT         NOT NULL DEFAULT 0,
  is_subscribed           BOOLEAN     NOT NULL DEFAULT FALSE,
  subscription_expires_at DATETIME,
  updated_at              DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

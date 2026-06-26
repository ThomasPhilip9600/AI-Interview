CREATE TABLE IF NOT EXISTS payments (
  id                  CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  user_id             CHAR(36)     NOT NULL,
  provider            VARCHAR(50),
  provider_payment_id VARCHAR(255),
  amount              INT          NOT NULL,
  currency            VARCHAR(10)  NOT NULL DEFAULT 'INR',
  plan_type           VARCHAR(100) NOT NULL,
  credits_granted     INT,
  status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

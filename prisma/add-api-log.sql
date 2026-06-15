-- Add plan column to Contact (idempotent)
ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "plan" TEXT NOT NULL DEFAULT 'enterprise';

-- Create ApiLog table
CREATE TABLE IF NOT EXISTS "ApiLog" (
    "id"         TEXT        NOT NULL,
    "userId"     TEXT        NOT NULL,
    "endpoint"   TEXT        NOT NULL,
    "method"     TEXT        NOT NULL,
    "agentId"    TEXT,
    "statusCode" INTEGER     NOT NULL,
    "latencyMs"  INTEGER     NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiLog_pkey" PRIMARY KEY ("id")
);

-- Foreign key (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ApiLog_userId_fkey'
  ) THEN
    ALTER TABLE "ApiLog"
      ADD CONSTRAINT "ApiLog_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS "ApiLog_userId_createdAt_idx" ON "ApiLog"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ApiLog_createdAt_idx"         ON "ApiLog"("createdAt");

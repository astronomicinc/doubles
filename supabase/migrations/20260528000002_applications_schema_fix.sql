-- Phase 3C: Add rejection_reason column to applications table
-- Created: 2026-05-28

ALTER TABLE applications
ADD COLUMN rejection_reason TEXT DEFAULT NULL;

-- Index for efficient filtering by rejection_reason
CREATE INDEX idx_applications_rejection_reason ON applications(rejection_reason) WHERE rejection_reason IS NOT NULL;

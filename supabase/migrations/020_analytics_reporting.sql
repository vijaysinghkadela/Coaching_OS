-- ============================================================================
-- Coaching OS — Migration 020: Analytics and Reporting
-- ============================================================================

-- Create analytics_events table for tracking user interactions
CREATE TABLE IF NOT EXISTS analytics_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL, -- e.g., 'session_attended', 'goal_updated', 'content_viewed'
  event_category  TEXT NOT NULL, -- e.g., 'engagement', 'learning', 'business'
  event_action    TEXT NOT NULL, -- e.g., 'click', 'submit', 'complete'
  event_label     TEXT, -- additional context
  event_value     DECIMAL(10,2), -- numeric value if applicable
  properties      JSONB DEFAULT '{}'::jsonb, -- flexible event properties
  page_url        TEXT, -- where the event occurred
  referrer        TEXT, -- where the user came from
  user_agent      TEXT, -- browser/device information
  ip_address      INET,
  session_id      TEXT, -- analytics session identifier
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create dashboard_metrics table for pre-calculated metrics
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  metric_name     TEXT NOT NULL, -- e.g., 'active_students', 'monthly_revenue'
  metric_category TEXT NOT NULL, -- e.g., 'engagement', 'financial', 'academic'
  metric_value    DECIMAL(15,2),
  metric_data     JSONB DEFAULT '{}'::jsonb, -- additional metric details
  period_type     TEXT CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start    DATE,
  period_end      DATE,
  calculated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_cached       BOOLEAN DEFAULT true,
  cache_expires   TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reports table for saved/custom reports
CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coach_profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  report_type     TEXT NOT NULL CHECK (report_type IN (
    'attendance', 'financial', 'progress', 'engagement', 'custom'
  )),
  filters         JSONB DEFAULT '{}'::jsonb, -- saved filter configurations
  columns         JSONB DEFAULT '[]'::jsonb, -- selected columns to display
  sort_by         JSONB DEFAULT '[]'::jsonb, -- sorting preferences
  chart_config    JSONB DEFAULT '{}'::jsonb, -- visualization settings
  schedule        JSONB DEFAULT '{}'::jsonb, -- auto-generation schedule
  last_generated  TIMESTAMPTZ,
  is_scheduled    BOOLEAN DEFAULT false,
  is_shared       BOOLEAN DEFAULT false,
  shared_with     UUID[] DEFAULT '{}'::uuid[], -- profiles with whom report is shared
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create report_snapshots table for historical report data
CREATE TABLE IF NOT EXISTS report_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  snapshot_data   JSONB NOT NULL, -- the actual report data
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create data_exports table for tracking exported data
CREATE TABLE IF NOT EXISTS data_exports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id    UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  export_type     TEXT NOT NULL CHECK (export_type IN ('csv', 'excel', 'pdf', 'json')),
  export_scope    TEXT NOT NULL CHECK (export_scope IN (
    'students', 'sessions', 'payments', 'goals', 'attendance', 'custom'
  )),
  filters_applied JSONB DEFAULT '{}'::jsonb, -- filters used for export
  record_count    INTEGER,
  file_url        TEXT, -- where the exported file is stored
  expires_at      TIMESTAMPTZ, -- when the export link expires
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_institute ON analytics_events(institute_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile ON analytics_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_action ON analytics_events(event_action);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_ip ON analytics_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_institute ON dashboard_metrics(institute_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_name ON dashboard_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_category ON dashboard_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_period ON dashboard_metrics(period_type, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_calculated_at ON dashboard_metrics(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_institute ON reports(institute_id);
CREATE INDEX IF NOT EXISTS idx_reports_coach ON reports(coach_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_scheduled ON reports(is_scheduled);
CREATE INDEX IF NOT EXISTS idx_report_snapshots_report ON report_snapshots(report_id);
CREATE INDEX IF NOT EXISTS idx_report_snapshots_generated_at ON report_snapshots(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_exports_institute ON data_exports(institute_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_profile ON data_exports(profile_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_type ON data_exports(export_type);
CREATE INDEX IF NOT EXISTS idx_data_exports_scope ON data_exports(export_scope);
CREATE INDEX IF NOT EXISTS idx_data_exports_created_at ON data_exports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_exports_expires ON data_exports(expires_at);

-- Enable RLS on new tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;

-- RLS policies for analytics_events
CREATE POLICY analytics_events_owner_all ON analytics_events
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY analytics_events_self ON analytics_events
  FOR SELECT USING (profile_id = auth.uid());

-- RLS policies for dashboard_metrics
CREATE POLICY dashboard_metrics_owner_all ON dashboard_metrics
  FOR ALL USING (institute_id = get_my_institute_id());

-- RLS policies for reports
CREATE POLICY reports_owner_all ON reports
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY reports_coach_read ON reports
  FOR SELECT USING (coach_id IN (SELECT id FROM coach_profiles WHERE profile_id = auth.uid()));
CREATE POLICY reports_client_read ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM report_snapshots
      WHERE report_snapshots.report_id = reports.id
        AND report_snapshots.snapshot_data ? 'client_id'
        AND (report_snapshots.snapshot_data->>'client_id')::uuid = auth.uid()
    )
  );

-- RLS policies for report_snapshots
CREATE POLICY report_snapshots_owner_all ON report_snapshots
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY report_snapshots_access ON report_snapshots
  FOR SELECT USING (
    report_id IN (
      SELECT id FROM reports WHERE institute_id = get_my_institute_id()
    )
  );

-- RLS policies for data_exports
CREATE POLICY data_exports_owner_all ON data_exports
  FOR ALL USING (institute_id = get_my_institute_id());
CREATE POLICY data_exports_self ON data_exports
  FOR SELECT USING (profile_id = auth.uid());

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_analytics_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_dashboard_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_report_snapshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_data_exports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trg_updated_analytics_events
  BEFORE UPDATE ON analytics_events FOR EACH ROW EXECUTE FUNCTION update_analytics_events_updated_at();

CREATE TRIGGER trg_updated_dashboard_metrics
  BEFORE UPDATE ON dashboard_metrics FOR EACH ROW EXECUTE FUNCTION update_dashboard_metrics_updated_at();

CREATE TRIGGER trg_updated_reports
  BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_reports_updated_at();

CREATE TRIGGER trg_updated_report_snapshots
  BEFORE UPDATE ON report_snapshots FOR EACH ROW EXECUTE FUNCTION update_report_snapshots_updated_at();

CREATE TRIGGER trg_updated_data_exports
  BEFORE UPDATE ON data_exports FOR EACH ROW EXECUTE FUNCTION update_data_exports_updated_at();

-- Add comments
COMMENT ON TABLE analytics_events IS 'Tracking of user interactions and system events for analytics';
COMMENT ON COLUMN analytics_events.event_type IS 'Specific type of event that occurred';
COMMENT ON COLUMN analytics_events.event_category IS 'Broader category of the event';
COMMENT ON COLUMN analytics_events.event_action IS 'Action taken in the event';
COMMENT ON COLUMN analytics_events.event_label IS 'Additional context or label for the event';
COMMENT ON COLUMN analytics_events.event_value IS 'Numeric value associated with the event (if applicable)';
COMMENT ON COLUMN analytics_events.properties IS 'Flexible JSON storage for event-specific properties';
COMMENT ON COLUMN analytics_events.page_url IS 'URL where the event occurred';
COMMENT ON COLUMN analytics_events.referrer IS 'Where the user came from before this event';
COMMENT ON COLUMN analytics_events.user_agent IS 'Browser/device information string';
COMMENT ON COLUMN analytics_events.ip_address IS 'IP address of the user';
COMMENT ON COLUMN analytics_events.session_id IS 'Analytics session identifier for grouping events';
COMMENT ON TABLE dashboard_metrics IS 'Pre-calculated metrics for dashboard display';
COMMENT ON COLUMN dashboard_metrics.metric_name IS 'Name/identifier of the metric';
COMMENT ON COLUMN dashboard_metrics.metric_category IS 'Category of the metric';
COMMENT ON COLUMN dashboard_metrics.metric_value IS 'Calculated value of the metric';
COMMENT ON COLUMN dashboard_metrics.metric_data IS 'Additional JSON data related to the metric';
COMMENT ON COLUMN dashboard_metrics.period_type IS 'Time period the metric covers';
COMMENT ON COLUMN dashboard_metrics.period_start IS 'Start date of the period';
COMMENT ON COLUMN dashboard_metrics.period_end IS 'End date of the period';
COMMENT ON COLUMN dashboard_metrics.calculated_at IS 'When the metric was last calculated';
COMMENT ON COLUMN dashboard_metrics.is_cached IS 'Whether the metric is currently cached';
COMMENT ON COLUMN dashboard_metrics.cache_expires IS 'When the cached metric expires';
COMMENT ON TABLE reports IS 'Saved report configurations and metadata';
COMMENT ON COLUMN reports.report_type IS 'Type of report';
COMMENT ON COLUMN reports.filters IS 'JSON object containing saved filter configurations';
COMMENT ON COLUMN reports.columns IS 'JSON array specifying which columns to include';
COMMENT ON COLUMN reports.sort_by IS 'JSON array specifying sort preferences';
COMMENT ON COLUMN reports.chart_config IS 'JSON object for visualization settings';
COMMENT ON COLUMN reports.schedule IS 'JSON object defining auto-generation schedule';
COMMENT ON COLUMN reports.last_generated IS 'When the report was last generated';
COMMENT ON COLUMN reports.is_scheduled IS 'Whether the report is set to auto-generate';
COMMENT ON COLUMN reports.is_shared IS 'Whether the report has been shared with others';
COMMENT ON COLUMN reports.shared_with IS 'Array of profile IDs with whom the report is shared';
COMMENT ON TABLE report_snapshots IS 'Historical snapshots of generated reports';
COMMENT ON COLUMN report_snapshots.snapshot_data IS 'The actual report data in JSON format';
COMMENT ON COLUMN report_snapshots.generated_at IS 'When this snapshot was generated';
COMMENT ON TABLE data_exports IS 'Tracking of data exports generated by users';
COMMENT ON COLUMN data_exports.export_type IS 'Format of the exported data';
COMMENT ON COLUMN data_exports.export_scope IS 'What data was included in the export';
COMMENT ON COLUMN data_exports.filters_applied IS 'Filters that were applied to the export';
COMMENT ON COLUMN data_exports.record_count IS 'Number of records in the export';
COMMENT ON COLUMN data_exports.file_url IS 'URL where the exported file is stored';
COMMENT ON COLUMN data_exports.expires_at IS 'When the export link will expire';
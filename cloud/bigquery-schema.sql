-- AarogyaGrid AI: BigQuery Analytics Data Definition Language (DDL)
-- Dataset: aarogyagrid_analytics

CREATE SCHEMA IF NOT EXISTS `aarogyagrid_analytics`
OPTIONS (
  location = "asia-south1",
  description = "AarogyaGrid AI Historical Healthcare Analytics and Forecasting Log"
);

-- 1. Primary Health Centres Table
CREATE TABLE IF NOT EXISTS `aarogyagrid_analytics.centres` (
  phc_id STRING NOT NULL,
  name STRING NOT NULL,
  district STRING NOT NULL,
  state STRING NOT NULL,
  latitude FLOAT64,
  longitude FLOAT64,
  total_beds INT64,
  doctors_total INT64,
  nurses_total INT64,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- 2. Daily Records & Footfall Table
CREATE TABLE IF NOT EXISTS `aarogyagrid_analytics.daily_records` (
  phc_id STRING NOT NULL,
  record_date DATE NOT NULL,
  day_of_week INT64,
  patients INT64,
  occupied_beds INT64,
  available_beds INT64,
  doctors_present INT64,
  nurses_present INT64,
  outbreak_flag INT64,
  ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY record_date
CLUSTER BY phc_id;

-- 3. Daily Medicine Inventory Snapshots
CREATE TABLE IF NOT EXISTS `aarogyagrid_analytics.inventory_snapshots` (
  snapshot_time TIMESTAMP NOT NULL,
  phc_id STRING NOT NULL,
  medicine STRING NOT NULL,
  unit STRING,
  quantity INT64,
  minimum_stock INT64,
  daily_usage FLOAT64
)
PARTITION BY DATE(snapshot_time)
CLUSTER BY phc_id, medicine;

-- 4. Forecast Predictions & Model Evaluation Log
CREATE TABLE IF NOT EXISTS `aarogyagrid_analytics.forecast_predictions` (
  prediction_id STRING NOT NULL,
  prediction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  phc_id STRING NOT NULL,
  medicine STRING NOT NULL,
  current_stock INT64,
  predicted_demand_tomorrow FLOAT64,
  days_to_stockout FLOAT64,
  stockout_risk FLOAT64,
  severity STRING,
  recommended_buffer_stock INT64,
  suggested_transfer_quantity INT64,
  model_type STRING,
  model_version STRING,
  mae FLOAT64,
  rmse FLOAT64
)
PARTITION BY DATE(prediction_time)
CLUSTER BY severity, phc_id;

-- 5. Inter-PHC Medicine Transfers Audit Trail
CREATE TABLE IF NOT EXISTS `aarogyagrid_analytics.transfers` (
  transfer_id STRING NOT NULL,
  from_phc_id STRING NOT NULL,
  to_phc_id STRING NOT NULL,
  medicine STRING NOT NULL,
  quantity INT64 NOT NULL,
  distance_km FLOAT64,
  status STRING NOT NULL,
  reason STRING,
  proposed_at TIMESTAMP,
  approved_by STRING,
  approved_at TIMESTAMP,
  completed_at TIMESTAMP
)
PARTITION BY DATE(proposed_at)
CLUSTER BY status, from_phc_id, to_phc_id;

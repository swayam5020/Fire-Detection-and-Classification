CREATE TABLE IF NOT EXISTS firms_raw_data (
    id BIGSERIAL PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    brightness DOUBLE PRECISION,
    scan DOUBLE PRECISION,
    track DOUBLE PRECISION,
    acq_date DATE,
    acq_time INTEGER,
    satellite VARCHAR(20),
    instrument VARCHAR(50),
    confidence VARCHAR(20),
    version VARCHAR(50),
    bright_t31 DOUBLE PRECISION,
    frp DOUBLE PRECISION,
    daynight VARCHAR(5),
    cluster_id BIGINT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    source VARCHAR(50) DEFAULT 'NASA_FIRMS',
    event_hash VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_firms_raw_location
ON firms_raw_data (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_firms_raw_date
ON firms_raw_data (acq_date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_firms_event_hash
ON firms_raw_data(event_hash);


CREATE TABLE IF NOT EXISTS processed_data (
    detection_count DOUBLE PRECISION,
    mean_frp DOUBLE PRECISION,
    max_frp DOUBLE PRECISION,
    mean_brightness DOUBLE PRECISION,
    max_brightness DOUBLE PRECISION,
    unique_detection_days DOUBLE PRECISION,
    observation_window_days DOUBLE PRECISION,
    spatial_spread_km DOUBLE PRECISION,
    temporal_recurrence DOUBLE PRECISION,
    duration_score DOUBLE PRECISION,
    detection_frequency DOUBLE PRECISION,
    spatial_consistency DOUBLE PRECISION,
    persistence_score DOUBLE PRECISION,
    land_cover_code DOUBLE PRECISION,
    is_cropland DOUBLE PRECISION,
    is_tree_cover DOUBLE PRECISION,
    is_built_up DOUBLE PRECISION,
    cropland_percentage DOUBLE PRECISION,
    tree_cover_percentage DOUBLE PRECISION,
    built_up_percentage DOUBLE PRECISION,
    grassland_percentage DOUBLE PRECISION,
    shrubland_percentage DOUBLE PRECISION,
    bare_sparse_percentage DOUBLE PRECISION,
    nearest_industrial_distance_km DOUBLE PRECISION,
    nearby_industrial_facility_count DOUBLE PRECISION,
    nearby_industrial_capacity_mw DOUBLE PRECISION,
    fire_class VARCHAR(30),
    cluster_id BIGINT,
    centroid_lat DOUBLE PRECISION,
    centroid_lon DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS idx_processed_cluster
ON processed_data(cluster_id);

CREATE INDEX IF NOT EXISTS idx_processed_location
ON processed_data(centroid_lat, centroid_lon);

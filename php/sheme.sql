
-- Table: odometer_stats
CREATE TABLE odometer_stats ( 
    id             INTEGER  PRIMARY KEY AUTOINCREMENT,
    total_distance REAL     DEFAULT ( 0 ),
    x_distance     REAL     DEFAULT ( 0 ),
    y_distance     REAL     DEFAULT ( 0 ),
    ratio          INTEGER  DEFAULT ( 0 ),
    date           DATETIME 
);


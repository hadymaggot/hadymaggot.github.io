-- sample.sql
INSERT INTO wilayah (id, name, geom) VALUES (1, 'Point A', ST_GeomFromText('POINT(100.0 0.0)', 4326));
INSERT INTO wilayah (id, name, geom) VALUES (2, 'Point B', ST_GeomFromText('POINT(101.0 1.0)', 4326));

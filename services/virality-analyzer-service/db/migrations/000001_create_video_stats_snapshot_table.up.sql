CREATE TABLE IF NOT EXISTS video_stats_snapshot (
                                                    id SERIAL PRIMARY KEY,
                                                    video_platform_id VARCHAR(255) NOT NULL,
                                                    source VARCHAR(50) NOT NULL,

                                                    author_username VARCHAR(255),
                                                    description TEXT,
                                                    video_url TEXT,
                                                    music_title TEXT,

                                                    snapshot_time TIMESTAMPTZ NOT NULL,
                                                    published_at TIMESTAMPTZ,

                                                    likes BIGINT,
                                                    comments BIGINT,
                                                    shares BIGINT,
                                                    views BIGINT
);

-- Создаем индекс для сверхбыстрого поиска видео по его ID и источнику
CREATE INDEX idx_source_platform_id ON video_stats_snapshot (source, video_platform_id);
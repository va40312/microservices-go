package domain

import "time"

type TikTokMessage struct {
	Source    string    `json:"source"`
	EventTime time.Time `json:"event_time"`
	DataType  string    `json:"data_type"`
	Payload   Payload   `json:"payload"`
}

type Payload struct {
	PlatformID  string      `json:"platform_id"`
	Description string      `json:"description"`
	PublishedAt *time.Time  `json:"published_at"` // Используем указатель, чтобы обработать null
	URL         string      `json:"url"`
	Stats       Stats       `json:"stats"`
	ContentMeta ContentMeta `json:"content_meta"`
	Author      Author      `json:"author"`
}

type Stats struct {
	Views    int64 `json:"views"`
	Likes    int64 `json:"likes"`
	Comments int64 `json:"comments"`
	Shares   int64 `json:"shares"`
}

type ContentMeta struct {
	MusicTitle string `json:"music_title"`
}

type Author struct {
	Username string `json:"username"`
}

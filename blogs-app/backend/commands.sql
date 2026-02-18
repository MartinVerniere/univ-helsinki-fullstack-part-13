CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text,
	url text NOT NULL,
	title text NOT NULL,
    likes integer DEFAULT 0,
    date time
);

INSERT INTO blogs (author, url, title, likes, date) VALUES
('Alice Johnson', 'https://example.com/tech-trends', 'Top 10 Tech Trends in 2026', 5, '2026-02-18 10:30:00'),
('Bob Smith', 'https://example.com/cooking-tips', '5 Easy Recipes for Busy Weeknights', 8, '2026-02-17 18:45:00');

select * from blogs;
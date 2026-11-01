CREATE TABLE daily_notes(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_date DATE NOT NULL,
    did_today TEXT,
    should_do_next TEXT,
    UNIQUE (user_id, note_date)
);

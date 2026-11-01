CREATE TABLE email_tokens(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('verify', 'change_email', 'reset')),
    token_hash VARCHAR(200) NOT NULL UNIQUE,
    new_email VARCHAR(200),
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);
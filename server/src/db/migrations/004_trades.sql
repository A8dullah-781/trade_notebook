CREATE TABLE trades(
    id SERIAL PRIMARY KEY,
    user_id NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pair VARCHAR(12) NOT NULL REFERENCES pairs(symbol),
    direction VARCHAR(5) NOT NULL CHECK (direction IN ('long', 'short')),
    entry_time TIMESTAMPTZ NOT NULL,
    exit_time TIMESTAMPTZ NOT NULL,
    entry_price NUMERIC(18,8) NOT NULL,
    exit_price NUMERIC(18,8) NOT NULL,
    stop_loss NUMERIC(18,8) NOT NULL,
    take_profit NUMERIC(18,8) NOT NULL,
    pnl_amount NUMERIC(14,2) NOT NULL,
    strategy_id INT NOT NULL,
    followed_strategy BOOLEAN NOT NULL,
    screenshot_url TEXT,
    screenshot_public_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
   
    FOREIGN KEY (strategy_id, user_id) REFERENCES strategies(id, user_id)

);

    CREATE INDEX trades_user_exit_idx ON trades(user_id, exit_time)
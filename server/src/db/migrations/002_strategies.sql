CREATE TABLE strategies (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,

-- it means that user1 say reversal then again it can never save user1 reversal again in the table
    UNIQUE (user_id, name),

    --It exists for one reason: a foreign key can only point at something Postgres knows is unique.
    -- it means that the strategy id and the userid will never store same again like strategy id = 1 and user id = 1 then again this same 1 1 never appear
    UNIQUE (id, user_id)
);
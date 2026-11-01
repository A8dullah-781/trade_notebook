-- CREATE TABLE	Make a new table
-- ALTER TABLE	Change an existing table (add a column, etc.)
-- DROP TABLE	Delete a table completely
-- PRIMARY KEY	Column that uniquely identifies each row
-- FOREIGN KEY / REFERENCES: Column that points to a row in another table
-- NOT NULL	Value is required
-- UNIQUE	No two rows can have the same value
-- DEFAULT	Value used when you don’t provide one
-- CHECK	Custom rule, e.g. direction must be long or short
-- CREATE INDEX	Makes lookups on a column faster
-- ON DELETE CASCADE	Deleting the parent row also deletes the child rows

-- SERIAL	Auto-incrementing integer, for ids
-- INT	Whole number
-- VARCHAR(n)	Text with a length limit
-- TEXT	Text with no limit
-- BOOLEAN	true / false
-- NUMERIC(p, s)	Exact decimal, for money and prices
-- DATE	Date only
-- TIMESTAMPTZ	Date and time, stored in UTC

-- INSERT INTO	Add a row
-- SELECT	Read rows
-- UPDATE ... SET	Change rows
-- DELETE FROM	Remove rows
-- WHERE	Filter which rows
-- ORDER BY	Sort the results
-- LIMIT / OFFSET	Pagination: how many rows, and where to start
-- RETURNING	Gives back the affected row after an insert or update

-- JOIN	Combine rows from two tables
-- GROUP BY	Group rows to summarize them
-- SUM, COUNT, AVG, MAX	Calculations over rows

-- BEGIN / COMMIT / ROLLBACK	Transactions: all steps succeed or none do


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    avatar_public_id TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- lookup on index for email column
CREATE UNIQUE INDEX users_email_lower_idx ON users (LOWER(email));



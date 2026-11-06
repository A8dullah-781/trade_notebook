ALTER TABLE trades
ADD COLUMN notes text CHECK (char_length(notes) <= 1000);
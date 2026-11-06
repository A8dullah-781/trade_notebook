INSERT INTO pairs(symbol, name, category) VALUES
('NZDUSD', 'New Zealand Dollar / US Dollar', 'forex'),
('EURCAD', 'Euro / Canadian Dollar', 'forex')
ON CONFLICT (symbol) DO NOTHING;
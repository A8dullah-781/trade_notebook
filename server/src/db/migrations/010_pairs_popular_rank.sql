ALTER TABLE pairs ADD COLUMN popular_rank int;


UPDATE pairs SET popular_rank = 1  WHERE symbol = 'EURUSD';
UPDATE pairs SET popular_rank = 2  WHERE symbol = 'GBPUSD';
UPDATE pairs SET popular_rank = 3  WHERE symbol = 'USDJPY';
UPDATE pairs SET popular_rank = 4  WHERE symbol = 'BTCUSD';
UPDATE pairs SET popular_rank = 5  WHERE symbol = 'ETHUSD';
UPDATE pairs SET popular_rank = 6  WHERE symbol = 'XAUUSD';
UPDATE pairs SET popular_rank = 7  WHERE symbol = 'USOIL';
UPDATE pairs SET popular_rank = 8  WHERE symbol = 'US30';
UPDATE pairs SET popular_rank = 9  WHERE symbol = 'NAS100';
UPDATE pairs SET popular_rank = 10 WHERE symbol = 'SPX500';
UPDATE pairs SET popular_rank = 11 WHERE symbol = 'GBPJPY';
UPDATE pairs SET popular_rank = 12 WHERE symbol = 'AUDUSD';
UPDATE pairs SET popular_rank = 13 WHERE symbol = 'USDCAD';
UPDATE pairs SET popular_rank = 14 WHERE symbol = 'USDCHF';
UPDATE pairs SET popular_rank = 15 WHERE symbol = 'SOLUSD';
UPDATE pairs SET popular_rank = 16 WHERE symbol = 'XRPUSD';
UPDATE pairs SET popular_rank = 17 WHERE symbol = 'NVDA';
UPDATE pairs SET popular_rank = 18 WHERE symbol = 'TSLA';
UPDATE pairs SET popular_rank = 19 WHERE symbol = 'AAPL';
UPDATE pairs SET popular_rank = 20 WHERE symbol = 'SPY';
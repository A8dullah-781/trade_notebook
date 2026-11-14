import { toCents, fromCents } from "./money.js";
import { withR } from "./tradeMath.js";


export function getBasicStats(days) {
  let netCents = 0;
  let winDays = 0;
  let lossDays = 0;
  let breakevenDays = 0;
  let bestDay = null;
  let bestCents = 0;

  for (const d of days) {
    const cents = toCents(d.total);

    netCents += cents;

    if (cents > 0) {
      winDays++;
    } else if (cents < 0) {
      lossDays++;
    } else {
      breakevenDays++;
    }

    if (cents > bestCents) {
      bestCents = cents;
      bestDay = d.day;
    }
  }

  return {
    netPnl: fromCents(netCents),
    tradingDays: days.length,
    winDays,
    lossDays,
    breakevenDays,
    bestDay: bestDay === null ? null : { day: bestDay, total: fromCents(bestCents) },
  };
}

export function getProfitFactor(days) {
  let grossProfit = 0;
  let grossLoss = 0;

  for (const d of days) {
    const cents = toCents(d.total);

    if (cents > 0) {
      grossProfit += cents;
    } else if (cents < 0) {
      grossLoss -= cents;
    }
  }

  if (grossLoss === 0) {
    return null;
  }

  return Math.round((grossProfit / grossLoss) * 100) / 100;
}

export function getMaxDrawdown(days) {
  let running = 0;
  let peak = 0;
  let maxDrop = 0;

  for (const d of days) {
    running += toCents(d.total);

    if (running > peak) {
      peak = running;
    }

    const drop = peak - running;

    if (drop > maxDrop) {
      maxDrop = drop;
    }
  }

  return maxDrop === 0 ? 0 : fromCents(-maxDrop);
}

export function getAverageR(trades) {
  let sumR = 0;
  let count = 0;

  for (const trade of trades) {
    const { result_r } = withR(trade);

    if (result_r === null) {
      continue;
    }

    sumR += result_r;
    count++;
  }

  if (count === 0) {
    return null;
  }

  return Math.round((sumR / count) * 100) / 100;
}

// add to src/utils/dashboardMath.js
export function getDisciplineStats(rows) {
  let followedTrades = 0;
  let skippedTrades = 0;
  let followedCents = 0;
  let skippedCents = 0;

  for (const row of rows) {
    const trades = Number(row.trades);
    const cents = toCents(row.total);

    if (row.followed_strategy) {
      followedTrades += trades;
      followedCents += cents;
    } else {
      skippedTrades += trades;
      skippedCents += cents;
    }
  }

  const totalTrades = followedTrades + skippedTrades;

  return {
    score:
      totalTrades === 0 ? null : Math.round((followedTrades / totalTrades) * 100),
    followedTrades,
    totalTrades,
    followedPnl: fromCents(followedCents),
    skippedPnl: fromCents(skippedCents),
  };
}
function pairKey(a, b) {
  return a < b ? a + "|" + b : b + "|" + a;
}

export function createMatchState() {
  return {
    rounds: [],
    gamesPlayed: {},
    sitOuts: {},
    partnerCount: {},
    opponentCount: {},
  };
}

function ensureMember(matchState, id) {
  if (matchState.gamesPlayed[id] === undefined) matchState.gamesPlayed[id] = 0;
  if (matchState.sitOuts[id] === undefined) matchState.sitOuts[id] = 0;
}

/**
 * Appends exactly one more round to matchState.rounds, using the running
 * gamesPlayed / sitOuts / partnerCount / opponentCount tallies so players
 * who sat out get priority to play next, and pairings stay varied.
 */
export function appendRound(members, courts, matchState) {
  members.forEach((m) => ensureMember(matchState, m.id));

  const capacity = Math.max(1, courts) * 4;
  let playN = Math.min(members.length, capacity);
  playN -= playN % 4;

  if (playN < 4) {
    const round = { courts: [], sitOut: members.map((m) => m.id) };
    matchState.rounds.push(round);
    round.sitOut.forEach((id) => (matchState.sitOuts[id] += 1));
    return round;
  }

  const sorted = members.slice().sort((a, b) => {
    const d = matchState.gamesPlayed[a.id] - matchState.gamesPlayed[b.id];
    if (d !== 0) return d;
    return Math.random() - 0.5;
  });
  const playing = sorted.slice(0, playN);
  const sittingOut = sorted.slice(playN).map((m) => m.id);

  // Repeat teammates are weighted far above repeat opponents so the search
  // effectively treats "never the same partner twice" as a hard rule and
  // only allows a repeat when every sampled arrangement needs one (e.g. a
  // small group over many rounds, where it's mathematically unavoidable).
  const PARTNER_REPEAT_WEIGHT = 1000;

  let best = null;
  let bestScore = Infinity;
  for (let attempt = 0; attempt < 600; attempt++) {
    const shuffled = playing.slice().sort(() => Math.random() - 0.5);
    const groups = [];
    for (let i = 0; i < shuffled.length; i += 4) groups.push(shuffled.slice(i, i + 4));

    let score = 0;
    const courtResult = groups.map((g) => {
      const splits = [
        [[g[0], g[1]], [g[2], g[3]]],
        [[g[0], g[2]], [g[1], g[3]]],
        [[g[0], g[3]], [g[1], g[2]]],
      ];
      let bestSplit = null;
      let bestSplitScore = Infinity;
      splits.forEach(([t1, t2]) => {
        const pk1 = pairKey(t1[0].id, t1[1].id);
        const pk2 = pairKey(t2[0].id, t2[1].id);
        let s = ((matchState.partnerCount[pk1] || 0) + (matchState.partnerCount[pk2] || 0)) * PARTNER_REPEAT_WEIGHT;
        t1.forEach((p1) => t2.forEach((p2) => {
          s += matchState.opponentCount[pairKey(p1.id, p2.id)] || 0;
        }));
        if (s < bestSplitScore) {
          bestSplitScore = s;
          bestSplit = { t1, t2 };
        }
      });
      score += bestSplitScore;
      return bestSplit;
    });

    if (score < bestScore) {
      bestScore = score;
      best = courtResult;
      if (bestScore === 0) break; // can't do better than zero repeats at all
    }
  }

  best.forEach((c) => {
    const pk1 = pairKey(c.t1[0].id, c.t1[1].id);
    const pk2 = pairKey(c.t2[0].id, c.t2[1].id);
    matchState.partnerCount[pk1] = (matchState.partnerCount[pk1] || 0) + 1;
    matchState.partnerCount[pk2] = (matchState.partnerCount[pk2] || 0) + 1;
    c.t1.forEach((p1) => c.t2.forEach((p2) => {
      const k = pairKey(p1.id, p2.id);
      matchState.opponentCount[k] = (matchState.opponentCount[k] || 0) + 1;
    }));
    c.t1.concat(c.t2).forEach((p) => (matchState.gamesPlayed[p.id] += 1));
  });
  sittingOut.forEach((id) => (matchState.sitOuts[id] += 1));

  const round = {
    courts: best.map((c, i) => ({ courtIndex: i + 1, team1: c.t1, team2: c.t2 })),
    sitOut: sittingOut,
  };
  matchState.rounds.push(round);
  return round;
}

/**
 * Builds a full fresh schedule of `totalRounds` rounds in one go, filling
 * every court each round rather than requiring one click per round.
 */
export function generateAllRounds(members, courts, totalRounds) {
  const matchState = createMatchState();
  for (let i = 0; i < totalRounds; i++) {
    appendRound(members, courts, matchState);
  }
  return matchState;
}

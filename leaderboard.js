const fs = require("fs");

// Get file path from CLI args
const filePath = process.argv[2];

if (!filePath) {
  console.error("❌ Usage: node leaderboard.js <path-to-json>");
  process.exit(1);
}

// Load JSON
let data;
try {
  data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
} catch (err) {
  console.error("❌ Failed to read JSON file:", err.message);
  process.exit(1);
}

// Weights (tweak anytime)
const WEIGHTS = {
  commits: 1,
  prsCreated: 5,
  prsMerged: 10,
  reviews: 3,
};

function computeScore(user) {
  return (
    (user.commits || 0) * WEIGHTS.commits +
    (user.prsCreated || 0) * WEIGHTS.prsCreated +
    (user.prsMerged || 0) * WEIGHTS.prsMerged +
    (user.reviews || 0) * WEIGHTS.reviews
  );
}

const contributors = data.contributors || {};

const leaderboard = Object.entries(contributors)
  .map(([user, stats]) => ({
    user,
    ...stats,
    score: computeScore(stats),
  }))
  .sort((a, b) => b.score - a.score)
  .map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));

// Output
console.log("\n🏆 CONTRIBUTION LEADERBOARD\n");

for (const entry of leaderboard) {
  console.log(
    `#${entry.rank} ${entry.user} - ${entry.score} pts ` +
    `(C:${entry.commits}, PR:${entry.prsCreated}, M:${entry.prsMerged}, R:${entry.reviews})`
  );
}

console.log("\n");
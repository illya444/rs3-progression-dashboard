const url = "http://localhost:3000/runemetrics/ILLYA444?activities=1";

const response = await fetch(url);
if (!response.ok) {
  console.error(`Validation failed: request returned ${response.status} ${response.statusText}`);
  process.exit(1);
}

const payload = await response.json();
const skills = Array.isArray(payload?.skills) ? payload.skills : null;
if (!skills) {
  console.error("Validation failed: response missing skills array");
  process.exit(1);
}

const farming = skills.find((skill) => skill?.id === 19);
if (!farming) {
  console.error("Validation failed: could not find Farming skill (id 19)");
  process.exit(1);
}

const xp = Number(farming.xp);
if (!Number.isFinite(xp) || xp <= 0 || xp > 200_000_000) {
  console.error(`Validation failed: Farming xp out of bounds (${xp})`);
  process.exit(1);
}

console.log(`RuneMetrics validation passed: Farming level=${farming.level}, xp=${xp}`);

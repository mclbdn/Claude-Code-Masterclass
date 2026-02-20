const ADJECTIVES = [
  "Silent",
  "Rapid",
  "Shadow",
  "Golden",
  "Electric",
  "Crystal",
  "Velvet",
  "Cosmic",
  "Frozen",
  "Blazing",
  "Mystic",
  "Thunder",
  "Silver",
  "Crimson",
  "Phantom",
  "Turbo",
  "Neon",
  "Diamond",
  "Stealth",
  "Quantum",
];

const NOUNS = [
  "Moon",
  "Storm",
  "Phoenix",
  "Tiger",
  "Dragon",
  "Wolf",
  "Eagle",
  "Viper",
  "Raven",
  "Falcon",
  "Shark",
  "Cobra",
  "Panther",
  "Hawk",
  "Lion",
  "Ninja",
  "Sword",
  "Arrow",
  "Comet",
  "Blade",
];

const ROLES = [
  "Warrior",
  "Hunter",
  "Phantom",
  "Legend",
  "Sage",
  "Ranger",
  "Knight",
  "Rogue",
  "Champion",
  "Guardian",
  "Master",
  "Sentinel",
  "Wizard",
  "Shadow",
  "Ghost",
  "Agent",
  "Ace",
  "Elite",
  "Baron",
  "Chief",
];

export function generateCodename(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const role = ROLES[Math.floor(Math.random() * ROLES.length)];

  return `${adjective}${noun}${role}`;
}

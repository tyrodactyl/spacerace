// Shared, tunable settings for the control page and the TV display.
window.SR_CONFIG = {
  periods: [1, 2, 3, 4, 5, 6],
  defaultTableCount: 8,
  maxTables: 9,

  // Table identity. Index 0 is "Table 1" and so on. Names show on the TV; keep them student-safe.
  tables: [
    { name: "Apollo",    color: "#d94a3d" },
    { name: "Artemis",   color: "#2f7de1" },
    { name: "Gemini",    color: "#2e9e5b" },
    { name: "Mercury",   color: "#8e5bd6" },
    { name: "Voyager",   color: "#d4741a" },
    { name: "Orion",     color: "#1a9a9a" },
    { name: "Odyssey",   color: "#d6478f" },
    { name: "Discovery", color: "#b8860b" },
    { name: "Pathfinder", color: "#5b6ee1" }
  ],

  // Reason presets on the phone map to rocket systems on the TV.
  systems: {
    fuel:     { label: "Fuel",     reason: "On task",       icon: "⛽" },
    crew:     { label: "Crew",     reason: "Helped a peer", icon: "👩‍🚀" },
    guidance: { label: "Guidance", reason: "Great answer",  icon: "🧭" },
    engines:  { label: "Engines",  reason: "Ready first",   icon: "🔥" }
  },
  systemOrder: ["fuel", "crew", "guidance", "engines"],

  // Build visibility. The TV only ever sees coarse stages (0..stages) per system, never raw points.
  // stage = min(stages, ceil(points / pointsPerStage)). Raise pointsPerStage if rockets finish too early.
  stages: 8,
  pointsPerStage: 2,

  // Quick amounts on the phone.
  amounts: [1, 2, 5]
};

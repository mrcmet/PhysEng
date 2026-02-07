export const PhysicsConfig = {
  gravity: { x: 0, y: -9.81 },

  // Timestep bounds (seconds)
  timestepMin: 1 / 240,   // 0.00417s — high precision
  timestepMax: 1 / 10,    // 0.1s — coarse
  timestepDefault: 1 / 60, // 0.01667s — standard

  velocityIterations: 8,
  positionIterations: 3,

  timestepPresets: [
    { label: '1/240 s', value: 1 / 240 },
    { label: '1/120 s', value: 1 / 120 },
    { label: '1/60 s',  value: 1 / 60 },
    { label: '1/30 s',  value: 1 / 30 },
    { label: '1/10 s',  value: 1 / 10 },
  ],
};

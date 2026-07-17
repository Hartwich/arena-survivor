export interface ArenaSurvivorVisualConfig {
  cameraPadding: {
    min: number;
    ratio: number;
    minZoom: number;
    maxZoom: number;
  };
  player: {
    // 1 means: visible sprite diameter matches the gameplay hitbox diameter exactly.
    // Values above 1 make the character visually larger than the real hitbox.
    diameterScale: number;
    bobAmplitude: number;
    bobSpeedMs: number;
    pulseAmplitude: number;
    pulseSpeedMs: number;
  };
  enemy: {
    // 1 means: visible sprite diameter matches the gameplay hitbox diameter exactly.
    // Values above 1 make the enemy visually larger than the real hitbox.
    diameterScale: number;
    pulseAmplitude: number;
    pulseSpeedMs: number;
    pulseSpeedVarianceMs: number;
  };
  weaponSlots: {
    spriteDisplaySizeMultiplier: number;
    minSpriteDisplaySize: number;
    fallbackDotRadiusMultiplier: number;
    minFallbackDotRadius: number;
    meleeSpriteRangeRatio: number;
    meleeMinSpriteDisplaySize: number;
    meleeMaxSpriteDisplaySize: number;
    meleeSpriteTipRatio: number;
  };
}

// Central host-only tuning for how Arena Survivor looks on screen.
// Player/enemy hitboxes are still defined on the server. Keep `diameterScale`
// at 1 when sprite size should visually match the real collision size.
export const arenaSurvivorVisualConfig: ArenaSurvivorVisualConfig = {
  cameraPadding: {
    min: 150,
    ratio: 0.18,
    minZoom: 0.6,
    maxZoom: 1.55
  },
  player: {
    diameterScale: 1.65,
    bobAmplitude: 2,
    bobSpeedMs: 200,
    pulseAmplitude: 0.02,
    pulseSpeedMs: 200
  },
  enemy: {
    diameterScale: 1.38,
    pulseAmplitude: 0.075,
    pulseSpeedMs: 200,
    pulseSpeedVarianceMs: 60
  },
  weaponSlots: {
    spriteDisplaySizeMultiplier: 1.75,
    minSpriteDisplaySize: 20,
    fallbackDotRadiusMultiplier: 0.16,
    minFallbackDotRadius: 2.8,
    meleeSpriteRangeRatio: 0.42,
    meleeMinSpriteDisplaySize: 32,
    meleeMaxSpriteDisplaySize: 84,
    meleeSpriteTipRatio: 0.42
  }
};

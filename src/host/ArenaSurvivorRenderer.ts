import Phaser from "phaser";
import {
  ARENA_SURVIVOR_MELEE_ARC_HALF_ANGLE_RAD,
  ARENA_SURVIVOR_MELEE_IMPACT_RATIO,
  ARENA_SURVIVOR_MELEE_SWING_DURATION_MS,
  ARENA_SURVIVOR_MAX_WEAPON_SLOTS,
  resolveArenaSurvivorWeaponOrbitDistance,
  resolveArenaSurvivorWeaponSlotTransform,
  type ArenaSurvivorState,
  type ArenaSurvivorWeaponCategory
} from "../protocol.js";
import {
  resolveArenaSurvivorEnemySpriteKey,
  resolveArenaSurvivorPickupSpriteKey,
  resolveArenaSurvivorPlayerSpriteKey,
  resolveArenaSurvivorWeaponCarrySpriteKey
} from "./arenaSurvivorAssets.js";
import { arenaSurvivorVisualConfig } from "./arenaSurvivorVisualConfig.js";

function toColor(color: string): number {
  return Phaser.Display.Color.HexStringToColor(color).color;
}

function resolveWeaponColor(category: ArenaSurvivorWeaponCategory): number {
  switch (category) {
    case "magic":
      return 0xa855f7;
    case "melee":
      return 0xf97316;
    case "ranged":
    default:
      return 0x38bdf8;
  }
}

function resolveProjectileAngle(vx: number, vy: number): number {
  return Math.atan2(vy, vx);
}

function resolvePlayerDisplayRadius(radius: number): number {
  return radius * arenaSurvivorVisualConfig.player.diameterScale;
}

const enemyVisualScaleByDefinition: Readonly<Record<string, number>> = {
  "slime-blob": 0.9,
  "needle-runner": 0.9,
  "loot-runner": 0.88,
  "fang-crawler": 0.96,
  "ember-wisp": 0.96,
  "ash-spitter": 0.98,
  "toxic-shroom": 1,
  "stone-brute": 1.06,
  "shell-bulwark": 1.08,
  "plague-lobber": 1.08,
  "elite-spitter": 1.08,
  "charger-hulk": 1.1,
  "iron-mauler": 1.14,
  "scrap-goliath": 1.18,
  "crimson-overlord": 1.22
};

function resolveEnemyDisplayRadius(radius: number, definitionId: string): number {
  return (
    radius *
    arenaSurvivorVisualConfig.enemy.diameterScale *
    (enemyVisualScaleByDefinition[definitionId] ?? 1)
  );
}

function hashSeed(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function resolvePhaseOffset(seedKey: string): number {
  return (hashSeed(seedKey) % 360) * (Math.PI / 180);
}

function resolvePlayerBobOffset(playerId: string, elapsedMs: number): number {
  const phase = resolvePhaseOffset(playerId);
  return (
    Math.sin(elapsedMs / arenaSurvivorVisualConfig.player.bobSpeedMs + phase) *
    arenaSurvivorVisualConfig.player.bobAmplitude
  );
}

function resolvePlayerPulseScale(playerId: string, elapsedMs: number): number {
  const phase = (hashSeed(playerId) % 360) * (Math.PI / 180);
  return 1 + Math.sin(elapsedMs / arenaSurvivorVisualConfig.player.pulseSpeedMs + phase) *
    arenaSurvivorVisualConfig.player.pulseAmplitude;
}

function resolveEnemyPulseScale(enemyId: string, elapsedMs: number): number {
  const phase = resolvePhaseOffset(enemyId);
  const speedOffset =
    ((hashSeed(`${enemyId}:speed`) % 1000) / 1000 - 0.5) * 2 * arenaSurvivorVisualConfig.enemy.pulseSpeedVarianceMs;
  const pulseSpeedMs = Math.max(180, arenaSurvivorVisualConfig.enemy.pulseSpeedMs + speedOffset);

  return 1 + Math.sin(elapsedMs / pulseSpeedMs + phase) * arenaSurvivorVisualConfig.enemy.pulseAmplitude;
}

function resolvePlayerVisualPosition(
  player: ArenaSurvivorState["players"][number],
  elapsedMs: number
): { x: number; y: number; bobOffset: number; pulseScale: number } {
  const bobOffset = resolvePlayerBobOffset(player.playerId, elapsedMs);
  const pulseScale = resolvePlayerPulseScale(player.playerId, elapsedMs);

  return {
    x: player.x,
    y: player.y - bobOffset,
    bobOffset,
    pulseScale
  };
}

function resolveWeaponAimAngle(
  player: ArenaSurvivorState["players"][number],
  state: ArenaSurvivorState,
  originX: number,
  originY: number,
  fallbackAngle: number
): number {
  const livingEnemies = state.enemies.filter((enemy) => enemy.alive);

  if (livingEnemies.length > 0) {
    const closestEnemy = livingEnemies.reduce((closest, enemy) => {
      const closestDistance = Phaser.Math.Distance.Squared(
        originX,
        originY,
        closest.x,
        closest.y
      );
      const nextDistance = Phaser.Math.Distance.Squared(
        originX,
        originY,
        enemy.x,
        enemy.y
      );

      return nextDistance < closestDistance ? enemy : closest;
    });

    return Math.atan2(closestEnemy.y - originY, closestEnemy.x - originX);
  }

  if (Math.hypot(player.vx, player.vy) > 8) {
    return Math.atan2(player.vy, player.vx);
  }

  return fallbackAngle;
}

function resolveMeleeSwingPose(
  lastFiredAt: number | null | undefined,
  elapsedMs: number
): { reachProgress: number; angleOffset: number } {
  if (lastFiredAt === null || lastFiredAt === undefined) {
    return { reachProgress: 0, angleOffset: 0 };
  }

  const elapsedSinceAttack = elapsedMs - lastFiredAt;

  if (elapsedSinceAttack < 0 || elapsedSinceAttack > ARENA_SURVIVOR_MELEE_SWING_DURATION_MS) {
    return { reachProgress: 0, angleOffset: 0 };
  }

  const impactAtMs = ARENA_SURVIVOR_MELEE_SWING_DURATION_MS * ARENA_SURVIVOR_MELEE_IMPACT_RATIO;

  if (elapsedSinceAttack <= impactAtMs) {
    const windupProgress = elapsedSinceAttack / Math.max(1, impactAtMs);
    return {
      reachProgress: windupProgress,
      angleOffset: -ARENA_SURVIVOR_MELEE_ARC_HALF_ANGLE_RAD * (1 - windupProgress)
    };
  }

  const followThroughProgress =
    (elapsedSinceAttack - impactAtMs) /
    Math.max(1, ARENA_SURVIVOR_MELEE_SWING_DURATION_MS - impactAtMs);

  return {
    reachProgress: Math.max(0, 1 - followThroughProgress),
    angleOffset: ARENA_SURVIVOR_MELEE_ARC_HALF_ANGLE_RAD * followThroughProgress
  };
}

function resolveWeaponDisplaySize(
  player: ArenaSurvivorState["players"][number],
  slotIndex: number
): number {
  const equippedWeapon = player.loadout.weapons[slotIndex];
  const weaponState = player.weaponRuntimeStates[slotIndex];
  const baseDisplaySize = Math.max(
    arenaSurvivorVisualConfig.weaponSlots.minSpriteDisplaySize,
    player.radius * arenaSurvivorVisualConfig.weaponSlots.spriteDisplaySizeMultiplier
  );

  if (equippedWeapon?.category !== "melee") {
    return equippedWeapon?.category === "ranged"
      ? baseDisplaySize * arenaSurvivorVisualConfig.weaponSlots.rangedSpriteScale
      : baseDisplaySize;
  }

  const effectiveRange = weaponState?.effectiveRange ?? weaponState?.lastAttackReachDistance ?? 0;
  return Phaser.Math.Clamp(
    Math.max(
      arenaSurvivorVisualConfig.weaponSlots.meleeMinSpriteDisplaySize,
      effectiveRange * arenaSurvivorVisualConfig.weaponSlots.meleeSpriteRangeRatio
    ),
    arenaSurvivorVisualConfig.weaponSlots.meleeMinSpriteDisplaySize,
    arenaSurvivorVisualConfig.weaponSlots.meleeMaxSpriteDisplaySize
  );
}

function resolveWeaponPose(
  player: ArenaSurvivorState["players"][number],
  state: ArenaSurvivorState,
  slotIndex: number,
  orbitDistance: number,
  playerPosition: { x: number; y: number },
  weaponDisplaySize: number
): { x: number; y: number; aimAngle: number } {
  const equippedWeapon = player.loadout.weapons[slotIndex];
  const weaponState = player.weaponRuntimeStates[slotIndex];
  const slotTransform = resolveArenaSurvivorWeaponSlotTransform(slotIndex, orbitDistance);
  const baseX = playerPosition.x + slotTransform.offsetX;
  const baseY = playerPosition.y + slotTransform.offsetY;
  const meleeSwingPose =
    equippedWeapon?.category === "melee"
      ? resolveMeleeSwingPose(weaponState?.lastFiredAt, state.elapsedMs)
      : { reachProgress: 0, angleOffset: 0 };
  const isActiveMeleeSwing =
    equippedWeapon?.category === "melee" &&
    meleeSwingPose.reachProgress > 0.01 &&
    weaponState?.lastAimAngleRad !== null &&
    weaponState?.lastAimAngleRad !== undefined;
  const meleeAimAngle = weaponState?.lastAimAngleRad ?? slotTransform.angleRad;
  const aimAngle =
    equippedWeapon?.category === "melee"
      ? isActiveMeleeSwing
        ? meleeAimAngle + meleeSwingPose.angleOffset
        : slotTransform.angleRad
      : resolveWeaponAimAngle(player, state, baseX, baseY, slotTransform.angleRad);
  const meleeLungeDistance =
    equippedWeapon?.category === "melee"
      ? Math.max(
        0,
        (weaponState?.lastAttackReachDistance ?? 0) -
          weaponDisplaySize * arenaSurvivorVisualConfig.weaponSlots.meleeSpriteTipRatio
      ) * meleeSwingPose.reachProgress
      : 0;

  return {
    x: baseX + Math.cos(aimAngle) * meleeLungeDistance,
    y: baseY + Math.sin(aimAngle) * meleeLungeDistance,
    aimAngle
  };
}

function drawProjectileDiamond(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  radius: number,
  fillColor: number
): void {
  graphics.fillStyle(fillColor, 0.96);
  graphics.fillPoints(
    [
      new Phaser.Geom.Point(x, y - radius),
      new Phaser.Geom.Point(x + radius, y),
      new Phaser.Geom.Point(x, y + radius),
      new Phaser.Geom.Point(x - radius, y)
    ],
    true
  );
}

function drawProjectileTriangle(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  radius: number,
  angleRad: number,
  fillColor: number
): void {
  const tipLength = radius * 1.65;
  const wingLength = radius * 0.9;
  const tip = new Phaser.Geom.Point(
    x + Math.cos(angleRad) * tipLength,
    y + Math.sin(angleRad) * tipLength
  );
  const left = new Phaser.Geom.Point(
    x + Math.cos(angleRad + Math.PI * 0.72) * wingLength,
    y + Math.sin(angleRad + Math.PI * 0.72) * wingLength
  );
  const right = new Phaser.Geom.Point(
    x + Math.cos(angleRad - Math.PI * 0.72) * wingLength,
    y + Math.sin(angleRad - Math.PI * 0.72) * wingLength
  );

  graphics.fillStyle(fillColor, 0.96);
  graphics.fillPoints([tip, left, right], true);
}

function drawProjectileBolt(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  radius: number,
  angleRad: number,
  fillColor: number
): void {
  const length = radius * 3.6;
  const tailX = x - Math.cos(angleRad) * length * 0.55;
  const tailY = y - Math.sin(angleRad) * length * 0.55;
  const headX = x + Math.cos(angleRad) * length * 0.55;
  const headY = y + Math.sin(angleRad) * length * 0.55;

  graphics.lineStyle(Math.max(2, radius * 0.95), fillColor, 0.98);
  graphics.lineBetween(tailX, tailY, headX, headY);
  graphics.fillStyle(0xffffff, 0.75);
  graphics.fillCircle(headX, headY, Math.max(1.4, radius * 0.45));
}

function drawArenaSurvivorProjectile(
  graphics: Phaser.GameObjects.Graphics,
  projectile: ArenaSurvivorState["projectiles"][number],
  x: number,
  y: number,
  radius: number
): void {
  const angleRad = resolveProjectileAngle(projectile.vx, projectile.vy);

  switch (projectile.definitionId) {
    case "hunter-arrow":
      drawProjectileTriangle(graphics, x, y, radius, angleRad, 0xf59e0b);
      graphics.lineStyle(Math.max(1, radius * 0.4), 0xfef3c7, 0.88);
      graphics.lineBetween(
        x - Math.cos(angleRad) * radius * 1.25,
        y - Math.sin(angleRad) * radius * 1.25,
        x + Math.cos(angleRad) * radius * 0.25,
        y + Math.sin(angleRad) * radius * 0.25
      );
      return;
    case "smg-pellet":
      drawProjectileBolt(graphics, x, y, Math.max(2.2, radius * 0.7), angleRad, 0xe2e8f0);
      return;
    case "ember-orb":
    case "ember-bolt":
      graphics.fillStyle(0xfb923c, 0.2);
      graphics.fillCircle(x, y, radius * 2.2);
      graphics.fillStyle(0xf97316, 0.97);
      graphics.fillCircle(x, y, radius * 1.15);
      graphics.fillStyle(0xfef3c7, 0.78);
      graphics.fillCircle(x, y, Math.max(1.4, radius * 0.45));
      return;
    case "frost-shard":
      graphics.lineStyle(Math.max(1, radius * 0.28), 0xe0f2fe, 0.85);
      drawProjectileDiamond(graphics, x, y, radius * 1.05, 0x67e8f9);
      graphics.strokePoints(
        [
          new Phaser.Geom.Point(x, y - radius * 1.05),
          new Phaser.Geom.Point(x + radius * 1.05, y),
          new Phaser.Geom.Point(x, y + radius * 1.05),
          new Phaser.Geom.Point(x - radius * 1.05, y)
        ],
        true
      );
      return;
    case "spark-bolt":
      drawProjectileBolt(graphics, x, y, radius, angleRad, 0x38bdf8);
      return;
    case "toxic-spore":
      graphics.fillStyle(0x22c55e, 0.18);
      graphics.fillCircle(x, y, radius * 2.25);
      graphics.fillStyle(0x4ade80, 0.94);
      graphics.fillCircle(x, y, radius * 1.2);
      graphics.lineStyle(Math.max(1, radius * 0.35), 0xbbf7d0, 0.78);
      graphics.strokeCircle(x, y, radius * 1.45);
      return;
    case "crimson-orb":
      graphics.fillStyle(0x7f1d1d, 0.18);
      graphics.fillCircle(x, y, radius * 2.5);
      graphics.fillStyle(0xef4444, 0.96);
      graphics.fillCircle(x, y, radius * 1.2);
      graphics.lineStyle(Math.max(1, radius * 0.3), 0xfda4af, 0.82);
      graphics.strokeCircle(x, y, radius * 1.55);
      graphics.fillStyle(0xffedd5, 0.82);
      graphics.fillCircle(x, y, Math.max(1.6, radius * 0.38));
      return;
    case "pistol-round":
      graphics.fillStyle(0xfbbf24, 0.96);
      graphics.fillCircle(x, y, radius);
      graphics.fillStyle(0xfffbeb, 0.75);
      graphics.fillCircle(x, y, Math.max(1.2, radius * 0.42));
      return;
    default:
      graphics.fillStyle(projectile.ownerKind === "enemy" ? 0xfb7185 : 0xfbbf24, 0.95);
      graphics.fillCircle(x, y, Math.max(2.5, radius));
  }
}

function drawSpawnIndicator(
  graphics: Phaser.GameObjects.Graphics,
  indicator: ArenaSurvivorState["spawnIndicators"][number],
  elapsedMs: number
): void {
  const warningDurationMs = Math.max(1, indicator.spawnAtMs - indicator.createdAtMs);
  const remainingMs = Math.max(0, indicator.spawnAtMs - elapsedMs);
  const progress = Phaser.Math.Clamp(1 - remainingMs / warningDurationMs, 0, 1);
  const pulse = 0.82 + Math.sin((elapsedMs - indicator.createdAtMs) / 70) * 0.18;
  const crossRadius = (16 + progress * 10) * 0.75;
  const ringRadius = crossRadius * (1.05 + pulse * 0.2);
  const alpha = 0.34 + progress * 0.36;

  graphics.fillStyle(0x7f1d1d, 0.12 + progress * 0.1);
  graphics.fillCircle(indicator.x, indicator.y, ringRadius * 1.1);
  graphics.lineStyle(2.5, 0xfca5a5, alpha * 0.9);
  graphics.strokeCircle(indicator.x, indicator.y, ringRadius);
  graphics.lineStyle(4, 0xef4444, 0.74 + progress * 0.22);
  graphics.lineBetween(
    indicator.x - crossRadius,
    indicator.y - crossRadius,
    indicator.x + crossRadius,
    indicator.y + crossRadius
  );
  graphics.lineBetween(
    indicator.x + crossRadius,
    indicator.y - crossRadius,
    indicator.x - crossRadius,
    indicator.y + crossRadius
  );
}

function drawMaterialPickup(
  graphics: Phaser.GameObjects.Graphics,
  pickup: ArenaSurvivorState["pickups"][number]
): void {
  const radius = Math.max(5.5, pickup.radius * 0.9);
  const pulse = 0.86 + Math.sin(pickup.ageMs / 160) * 0.12;
  const coreRadius = radius * pulse;

  graphics.fillStyle(0xf59e0b, 0.14);
  graphics.fillCircle(pickup.x, pickup.y, radius * 1.65);
  graphics.lineStyle(2, 0xfcd34d, 0.9);
  graphics.strokeCircle(pickup.x, pickup.y, radius * 1.1);
  graphics.fillStyle(0xfbbf24, 0.96);
  graphics.fillPoints(
    [
      new Phaser.Geom.Point(pickup.x, pickup.y - coreRadius),
      new Phaser.Geom.Point(pickup.x + coreRadius * 0.72, pickup.y),
      new Phaser.Geom.Point(pickup.x, pickup.y + coreRadius),
      new Phaser.Geom.Point(pickup.x - coreRadius * 0.72, pickup.y)
    ],
    true
  );
  graphics.fillStyle(0xfffbeb, 0.7);
  graphics.fillCircle(pickup.x, pickup.y, Math.max(1.3, coreRadius * 0.22));
}

function drawHealthPickup(
  graphics: Phaser.GameObjects.Graphics,
  pickup: ArenaSurvivorState["pickups"][number]
): void {
  const radius = Math.max(6, pickup.radius);
  const pulse = 0.9 + Math.sin(pickup.ageMs / 145) * 0.1;
  const arm = radius * pulse;
  const thickness = Math.max(3, radius * 0.46);

  graphics.fillStyle(0x14532d, 0.16);
  graphics.fillCircle(pickup.x, pickup.y, radius * 1.75);
  graphics.lineStyle(2, 0x86efac, 0.92);
  graphics.strokeCircle(pickup.x, pickup.y, radius * 1.12);
  graphics.lineStyle(thickness, 0x22c55e, 0.98);
  graphics.lineBetween(pickup.x - arm, pickup.y, pickup.x + arm, pickup.y);
  graphics.lineBetween(pickup.x, pickup.y - arm, pickup.x, pickup.y + arm);
  graphics.fillStyle(0xdcfce7, 0.78);
  graphics.fillCircle(pickup.x, pickup.y, Math.max(1.5, radius * 0.22));
}

export interface ArenaSurvivorRenderMeta {
  centerX: number;
  centerY: number;
  zoom: number;
  worldViewWidth: number;
  worldViewHeight: number;
  arenaWidth: number;
  arenaHeight: number;
  left: number;
  top: number;
}

export interface ArenaSurvivorSpriteLayer {
  playerSprites: Map<string, Phaser.GameObjects.Image>;
  enemySprites: Map<string, Phaser.GameObjects.Image>;
  pickupSprites: Map<string, Phaser.GameObjects.Image>;
  weaponSprites: Map<string, Phaser.GameObjects.Image>;
}

export function resolveArenaSurvivorRenderMeta(
  scene: Phaser.Scene,
  state: ArenaSurvivorState
): ArenaSurvivorRenderMeta {
  const alivePlayers = state.players.filter((player) => player.alive);
  const cameraPadding = Math.max(
    arenaSurvivorVisualConfig.cameraPadding.min,
    Math.round(
      Math.min(state.arenaWidth, state.arenaHeight) * arenaSurvivorVisualConfig.cameraPadding.ratio
    )
  );
  const arenaFitZoom = Math.max(
    scene.scale.width / state.arenaWidth,
    scene.scale.height / state.arenaHeight
  );
  const minZoom = Math.max(arenaSurvivorVisualConfig.cameraPadding.minZoom, arenaFitZoom);
  const maxZoom = Math.max(arenaSurvivorVisualConfig.cameraPadding.maxZoom, minZoom);
  let centerX = state.arenaWidth / 2;
  let centerY = state.arenaHeight / 2;
  let zoom = 1;

  if (alivePlayers.length === 1) {
    const player = alivePlayers[0];
    centerX = player.x;
    centerY = player.y;
    zoom = maxZoom;
  } else if (alivePlayers.length > 1) {
    const minX = Math.min(...alivePlayers.map((player) => player.x));
    const maxX = Math.max(...alivePlayers.map((player) => player.x));
    const minY = Math.min(...alivePlayers.map((player) => player.y));
    const maxY = Math.max(...alivePlayers.map((player) => player.y));
    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    const paddedWidth = width + cameraPadding * 2;
    const paddedHeight = height + cameraPadding * 2;
    centerX = (minX + maxX) / 2;
    centerY = (minY + maxY) / 2;
    zoom = Math.min(scene.scale.width / paddedWidth, scene.scale.height / paddedHeight, maxZoom);
  }

  zoom = Phaser.Math.Clamp(zoom, minZoom, maxZoom);

  const worldViewWidth = scene.scale.width / zoom;
  const worldViewHeight = scene.scale.height / zoom;
  const halfWidth = worldViewWidth / 2;
  const halfHeight = worldViewHeight / 2;

  centerX = Phaser.Math.Clamp(centerX, halfWidth, Math.max(halfWidth, state.arenaWidth - halfWidth));
  centerY = Phaser.Math.Clamp(centerY, halfHeight, Math.max(halfHeight, state.arenaHeight - halfHeight));

  return {
    centerX,
    centerY,
    zoom,
    worldViewWidth,
    worldViewHeight,
    arenaWidth: state.arenaWidth,
    arenaHeight: state.arenaHeight,
    left: centerX - halfWidth,
    top: centerY - halfHeight
  };
}

export function applyArenaSurvivorCamera(
  scene: Phaser.Scene,
  meta: ArenaSurvivorRenderMeta
): void {
  const camera = scene.cameras.main;

  camera.setBounds(0, 0, meta.arenaWidth, meta.arenaHeight);
  camera.setZoom(meta.zoom);
  camera.centerOn(meta.centerX, meta.centerY);
}

export function createArenaSurvivorSpriteLayer(): ArenaSurvivorSpriteLayer {
  return {
    playerSprites: new Map(),
    enemySprites: new Map(),
    pickupSprites: new Map(),
    weaponSprites: new Map()
  };
}

export function drawArenaSurvivorBackground(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  state: ArenaSurvivorState,
  meta: ArenaSurvivorRenderMeta = resolveArenaSurvivorRenderMeta(scene, state)
): void {
  void scene;
  void state;
  graphics.clear();
  graphics.lineStyle(3, 0xe3c59d, 0.12);
  graphics.strokeRoundedRect(0, 0, meta.arenaWidth, meta.arenaHeight, 18);
}

export function drawArenaSurvivorPlayerHealthBars(
  graphics: Phaser.GameObjects.Graphics,
  state: ArenaSurvivorState
): void {
  graphics.clear();

  for (const player of state.players) {
    if (!player.alive) {
      continue;
    }

    const playerPosition = resolvePlayerVisualPosition(player, state.elapsedMs);
    const displayRadius =
      resolvePlayerDisplayRadius(Math.max(10, player.radius)) * playerPosition.pulseScale;
    const hpRatio = player.maxHp > 0
      ? Phaser.Math.Clamp(player.hp / player.maxHp, 0, 1)
      : 0;

    if (hpRatio >= 0.999) {
      continue;
    }

    const width = Phaser.Math.Clamp(displayRadius * 1.55, 28, 50);
    const height = 4;
    const left = playerPosition.x - width / 2;
    const top = playerPosition.y - displayRadius - 5;
    const fillColor = hpRatio > 0.5 ? 0x22c55e : hpRatio > 0.25 ? 0xf59e0b : 0xef4444;

    graphics.fillStyle(0x020617, 0.88);
    graphics.fillRoundedRect(left - 1, top - 1, width + 2, height + 2, 3);
    graphics.fillStyle(0x1e293b, 0.96);
    graphics.fillRoundedRect(left, top, width, height, 2);

    if (hpRatio > 0) {
      graphics.fillStyle(fillColor, 1);
      graphics.fillRoundedRect(left, top, width * hpRatio, height, 2);
    }

    graphics.lineStyle(1, 0xe2e8f0, 0.55);
    graphics.strokeRoundedRect(left, top, width, height, 2);
  }
}

export function drawArenaSurvivorEntities(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics,
  state: ArenaSurvivorState,
  meta: ArenaSurvivorRenderMeta = resolveArenaSurvivorRenderMeta(scene, state)
): void {
  void meta;
  graphics.clear();

  if (state.visualTheme === "obsidian-relay") {
    const relayPulse = 0.45 + Math.sin(state.elapsedMs / 520) * 0.18;
    const scanAngle = state.elapsedMs / 2400;
    const relayNodes = [
      { x: 150, y: 190 },
      { x: 1130, y: 190 },
      { x: 150, y: 530 },
      { x: 1130, y: 530 }
    ];

    graphics.lineStyle(2, 0x67e8f9, relayPulse);
    for (const node of relayNodes) {
      graphics.strokeCircle(node.x, node.y, 12 + relayPulse * 8);
    }

    graphics.lineStyle(2, 0xc87545, 0.22);
    graphics.strokeCircle(state.arenaWidth / 2, state.arenaHeight / 2, 116 + Math.sin(state.elapsedMs / 760) * 7);
    graphics.lineStyle(2, 0x67e8f9, 0.16);
    graphics.lineBetween(
      state.arenaWidth / 2,
      state.arenaHeight / 2,
      state.arenaWidth / 2 + Math.cos(scanAngle) * 104,
      state.arenaHeight / 2 + Math.sin(scanAngle) * 104
    );
  } else if (state.visualTheme === "ironbound-dungeon") {
    const runePulse = 0.34 + Math.sin(state.elapsedMs / 640) * 0.12;
    const runeRadius = 84 + Math.sin(state.elapsedMs / 880) * 6;
    const centerX = state.arenaWidth / 2;
    const centerY = state.arenaHeight / 2;

    graphics.lineStyle(3, 0xfacc15, runePulse);
    graphics.strokeCircle(centerX, centerY, runeRadius);
    graphics.lineStyle(2, 0xa78bfa, runePulse + 0.08);
    graphics.strokeCircle(centerX, centerY, runeRadius - 14);

    for (let index = 0; index < 8; index += 1) {
      const angle = (Math.PI * 2 * index) / 8 + state.elapsedMs / 7200;
      const innerX = centerX + Math.cos(angle) * (runeRadius - 22);
      const innerY = centerY + Math.sin(angle) * (runeRadius - 22);
      const outerX = centerX + Math.cos(angle) * (runeRadius + 8);
      const outerY = centerY + Math.sin(angle) * (runeRadius + 8);
      graphics.lineBetween(innerX, innerY, outerX, outerY);
    }
  }

  for (const projectile of state.projectiles) {
    if (!projectile.alive) {
      continue;
    }

    drawArenaSurvivorProjectile(
      graphics,
      projectile,
      projectile.x,
      projectile.y,
      Math.max(2.5, projectile.radius)
    );
  }

  for (const indicator of state.spawnIndicators) {
    drawSpawnIndicator(graphics, indicator, state.elapsedMs);
  }

  for (const pickup of state.pickups) {
    if (resolveArenaSurvivorPickupSpriteKey(pickup.kind, state.visualTheme)) {
      continue;
    }

    if (pickup.kind === "health") {
      drawHealthPickup(graphics, pickup);
      continue;
    }

    drawMaterialPickup(graphics, pickup);
  }

  for (const player of state.players) {
    const playerPosition = resolvePlayerVisualPosition(player, state.elapsedMs);
    const playerX = playerPosition.x;
    const playerY = playerPosition.y;
    const playerRadius = Math.max(10, player.radius);
    const playerDisplayRadius = resolvePlayerDisplayRadius(playerRadius) * playerPosition.pulseScale;
    const slotDistance = resolveArenaSurvivorWeaponOrbitDistance(player.radius);
    const occupiedSlots = player.loadout.weapons;

    for (let slotIndex = 0; slotIndex < ARENA_SURVIVOR_MAX_WEAPON_SLOTS; slotIndex += 1) {
      const equippedWeapon = occupiedSlots[slotIndex];

      if (
        equippedWeapon &&
        !resolveArenaSurvivorWeaponCarrySpriteKey(equippedWeapon.weaponId, state.visualTheme)
      ) {
        const weaponDisplaySize = resolveWeaponDisplaySize(player, slotIndex);
        const weaponPose = resolveWeaponPose(player, state, slotIndex, slotDistance, {
          x: playerX,
          y: playerY
        }, weaponDisplaySize);
        const fallbackTipLength = Math.max(8, weaponDisplaySize * 0.4);
        const fallbackHalfWidth = Math.max(5, weaponDisplaySize * 0.25);
        graphics.fillStyle(resolveWeaponColor(equippedWeapon.category), 0.95);
        graphics.fillTriangle(
          weaponPose.x + Math.cos(weaponPose.aimAngle) * fallbackTipLength,
          weaponPose.y + Math.sin(weaponPose.aimAngle) * fallbackTipLength,
          weaponPose.x + Math.cos(weaponPose.aimAngle + 2.4) * fallbackHalfWidth,
          weaponPose.y + Math.sin(weaponPose.aimAngle + 2.4) * fallbackHalfWidth,
          weaponPose.x + Math.cos(weaponPose.aimAngle - 2.4) * fallbackHalfWidth,
          weaponPose.y + Math.sin(weaponPose.aimAngle - 2.4) * fallbackHalfWidth
        );
      }
    }

    if (!scene.textures.exists(resolveArenaSurvivorPlayerSpriteKey(player.character.id, state.visualTheme))) {
      const playerColor = player.alive ? toColor(player.color) : toColor("#64748b");

      graphics.fillStyle(0x020617, 0.35);
      graphics.fillEllipse(playerX, playerY + playerDisplayRadius * 0.92, playerDisplayRadius * 1.45, playerDisplayRadius * 0.46);
      graphics.fillStyle(playerColor, player.alive ? 1 : 0.45);
      graphics.fillCircle(playerX, playerY, playerDisplayRadius);
      graphics.lineStyle(3, 0xe2e8f0, player.alive ? 0.9 : 0.4);
      graphics.strokeCircle(playerX, playerY, playerDisplayRadius);
    }
  }

  for (const enemy of state.enemies) {
    if (!enemy.alive) {
      continue;
    }

    const spriteKey = resolveArenaSurvivorEnemySpriteKey(enemy.definitionId, state.visualTheme);
    if (spriteKey && scene.textures.exists(spriteKey)) {
      continue;
    }

    const enemyColor = enemy.role === "shooter" ? 0xfb7185 : enemy.role === "brute" ? 0xf97316 : 0xf59e0b;
    const px = enemy.x;
    const py = enemy.y;
    const radius = Math.max(8, enemy.radius);
    const displayRadius =
      resolveEnemyDisplayRadius(radius, enemy.definitionId) *
      resolveEnemyPulseScale(enemy.id, state.elapsedMs);
    const hpRatio = enemy.maxHp > 0 ? Math.max(0, Math.min(1, enemy.hp / enemy.maxHp)) : 0;

    graphics.fillStyle(enemyColor, 0.8);
    graphics.fillCircle(px, py, displayRadius);
    graphics.lineStyle(2, 0x1f2937, 0.8);
    graphics.strokeCircle(px, py, displayRadius);
    graphics.lineStyle(Math.max(2, displayRadius * 0.12), 0xfef3c7, 0.9 * hpRatio);
    graphics.strokeCircle(px, py, displayRadius + 4);
  }
}

export function syncArenaSurvivorSpriteLayer(
  scene: Phaser.Scene,
  layer: ArenaSurvivorSpriteLayer,
  state: ArenaSurvivorState,
  meta: ArenaSurvivorRenderMeta = resolveArenaSurvivorRenderMeta(scene, state)
): void {
  void meta;
  const activePlayerIds = new Set(state.players.map((player) => player.playerId));

  for (const player of state.players) {
    const spriteKey = resolveArenaSurvivorPlayerSpriteKey(player.character.id, state.visualTheme);
    let playerSprite = layer.playerSprites.get(player.playerId);
    const playerPosition = resolvePlayerVisualPosition(player, state.elapsedMs);

    if (!scene.textures.exists(spriteKey)) {
      if (playerSprite) {
        playerSprite.setVisible(false);
      }
      continue;
    }

    if (!playerSprite) {
      playerSprite = scene.add.image(0, 0, spriteKey);
      playerSprite.setDepth(10);
      playerSprite.setOrigin(0.5);
      layer.playerSprites.set(player.playerId, playerSprite);
    } else if (playerSprite.texture.key !== spriteKey) {
      playerSprite.setTexture(spriteKey);
    }

    playerSprite.setVisible(player.alive);
    playerSprite.setPosition(playerPosition.x, playerPosition.y);
    const displaySize = resolvePlayerDisplayRadius(player.radius) * 2 * playerPosition.pulseScale;
    playerSprite.setDisplaySize(displaySize, displaySize);
    playerSprite.setRotation(0);
    playerSprite.setAlpha(player.alive ? 1 : 0.42);
  }

  for (const [playerId, playerSprite] of layer.playerSprites) {
    if (!activePlayerIds.has(playerId)) {
      playerSprite.destroy();
      layer.playerSprites.delete(playerId);
    }
  }

  const activeEnemyIds = new Set(state.enemies.filter((enemy) => enemy.alive).map((enemy) => enemy.id));
  const activePickupIds = new Set<string>();
  const activeWeaponKeys = new Set<string>();

  for (const pickup of state.pickups) {
    const spriteKey = resolveArenaSurvivorPickupSpriteKey(pickup.kind, state.visualTheme);

    if (!spriteKey || !scene.textures.exists(spriteKey)) {
      continue;
    }

    let pickupSprite = layer.pickupSprites.get(pickup.id);

    if (!pickupSprite) {
      pickupSprite = scene.add.image(0, 0, spriteKey);
      pickupSprite.setDepth(8);
      pickupSprite.setOrigin(0.5);
      layer.pickupSprites.set(pickup.id, pickupSprite);
    } else if (pickupSprite.texture.key !== spriteKey) {
      pickupSprite.setTexture(spriteKey);
    }

    const pulse = 0.94 + Math.sin(pickup.ageMs / 150) * 0.08;
    const displaySize = Math.max(pickup.kind === "health" ? 30 : 26, pickup.radius * 2.8) * pulse;
    pickupSprite.setVisible(true);
    pickupSprite.setPosition(pickup.x, pickup.y);
    pickupSprite.setDisplaySize(displaySize, displaySize);
    pickupSprite.setAlpha(0.98);
    activePickupIds.add(pickup.id);
  }

  for (const [pickupId, pickupSprite] of layer.pickupSprites) {
    if (!activePickupIds.has(pickupId)) {
      pickupSprite.destroy();
      layer.pickupSprites.delete(pickupId);
    }
  }

  for (const enemy of state.enemies) {
    if (!enemy.alive) {
      continue;
    }

    const spriteKey = resolveArenaSurvivorEnemySpriteKey(enemy.definitionId, state.visualTheme);

    if (!spriteKey || !scene.textures.exists(spriteKey)) {
      continue;
    }

    let enemySprite = layer.enemySprites.get(enemy.id);

    if (!enemySprite) {
      enemySprite = scene.add.image(0, 0, spriteKey);
      enemySprite.setDepth(9);
      enemySprite.setOrigin(0.5);
      layer.enemySprites.set(enemy.id, enemySprite);
    } else if (enemySprite.texture.key !== spriteKey) {
      enemySprite.setTexture(spriteKey);
    }

    const displaySize =
      resolveEnemyDisplayRadius(enemy.radius, enemy.definitionId) *
      2 *
      resolveEnemyPulseScale(enemy.id, state.elapsedMs);

    enemySprite.setVisible(true);
    enemySprite.setPosition(enemy.x, enemy.y);
    enemySprite.setDisplaySize(displaySize, displaySize);
    enemySprite.setFlipX(enemy.vx < -1);
    enemySprite.setAlpha(0.92);
  }

  for (const player of state.players) {
    const playerPosition = resolvePlayerVisualPosition(player, state.elapsedMs);
    const orbitDistance = resolveArenaSurvivorWeaponOrbitDistance(player.radius);

    for (let slotIndex = 0; slotIndex < ARENA_SURVIVOR_MAX_WEAPON_SLOTS; slotIndex += 1) {
      const equippedWeapon = player.loadout.weapons[slotIndex];
      const spriteId = `${player.playerId}:${slotIndex}`;
      const weaponSprite = layer.weaponSprites.get(spriteId);

      if (!equippedWeapon) {
        if (weaponSprite) {
          weaponSprite.destroy();
          layer.weaponSprites.delete(spriteId);
        }
        continue;
      }

      const spriteKey = resolveArenaSurvivorWeaponCarrySpriteKey(
        equippedWeapon.weaponId,
        state.visualTheme
      );

      if (!spriteKey || !scene.textures.exists(spriteKey)) {
        if (weaponSprite) {
          weaponSprite.destroy();
          layer.weaponSprites.delete(spriteId);
        }
        continue;
      }

      const displaySize = resolveWeaponDisplaySize(player, slotIndex);
      const weaponPose = resolveWeaponPose(
        player,
        state,
        slotIndex,
        orbitDistance,
        playerPosition,
        displaySize
      );
      let nextWeaponSprite = weaponSprite;

      if (!nextWeaponSprite) {
        nextWeaponSprite = scene.add.image(0, 0, spriteKey);
        nextWeaponSprite.setDepth(11);
        nextWeaponSprite.setOrigin(0.5);
        layer.weaponSprites.set(spriteId, nextWeaponSprite);
      } else if (nextWeaponSprite.texture.key !== spriteKey) {
        nextWeaponSprite.setTexture(spriteKey);
      }

      nextWeaponSprite.setVisible(player.alive);
      nextWeaponSprite.setPosition(weaponPose.x, weaponPose.y);
      nextWeaponSprite.setDisplaySize(displaySize, displaySize);
      const mirrorRangedWeapon =
        equippedWeapon.category === "ranged" &&
        Math.cos(weaponPose.aimAngle) < 0;
      nextWeaponSprite.setFlipY(mirrorRangedWeapon);
      nextWeaponSprite.setRotation(
        mirrorRangedWeapon
          ? weaponPose.aimAngle - Math.PI / 2
          : weaponPose.aimAngle + Math.PI / 2
      );
      nextWeaponSprite.setAlpha(player.alive ? 0.98 : 0.38);
      activeWeaponKeys.add(spriteId);
    }
  }

  for (const [enemyId, enemySprite] of layer.enemySprites) {
    if (!activeEnemyIds.has(enemyId)) {
      enemySprite.destroy();
      layer.enemySprites.delete(enemyId);
    }
  }

  for (const [weaponId, weaponSprite] of layer.weaponSprites) {
    if (!activeWeaponKeys.has(weaponId)) {
      weaponSprite.destroy();
      layer.weaponSprites.delete(weaponId);
    }
  }
}

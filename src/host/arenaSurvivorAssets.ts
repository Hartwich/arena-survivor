import Phaser from "phaser";
import type { ArenaSurvivorVisualTheme } from "../protocol.js";
import {
  resolveArenaSurvivorCharacterThemeAssetId,
  resolveArenaSurvivorEnemyThemeAssetId,
  resolveArenaSurvivorThemeAssetPath,
  resolveArenaSurvivorWeaponThemeAssetId
} from "../visualThemes.js";

const characterAssetIds = [
  { id: "schrotto-scharfschuss", assetId: "schrotto-scharfschuss" },
  { id: "kloppbert-keulenwucht", assetId: "kloppbert-keulenwucht" },
  { id: "funkenberta-flaemmchen", assetId: "funkenberta-flaemmchen" },
  { id: "kanni-baldrian", assetId: "kanni-baldrian" },
  { id: "doktor-knolle", assetId: "doktor-knolle" },
  { id: "sir-pampel-panzer", assetId: "sir-pampel-panzer" },
  { id: "flitzelotte", assetId: "flitzelotte" },
  { id: "professor-paradox", assetId: "professor-paradox" },
  { id: "rundling-allround", assetId: "rundling-allround" },
  { id: "pruegler-brawler", assetId: "pruegler-brawler" },
  { id: "jaeger-ranger", assetId: "jaeger-ranger" },
  { id: "gluecksknolle-lucky", assetId: "gluecksknolle-lucky" },
  { id: "ackerling-farmer", assetId: "ackerling-farmer" }
] as const;
const enemyAssetIds = [
  { id: "slime-blob", assetId: "slime-blob" },
  { id: "fang-crawler", assetId: "fang-crawler" },
  { id: "needle-runner", assetId: "fang-crawler" },
  { id: "stone-brute", assetId: "stone-brute" },
  { id: "shell-bulwark", assetId: "stone-brute" },
  { id: "ember-wisp", assetId: "ember-wisp" },
  { id: "toxic-shroom", assetId: "toxic-shroom" },
  { id: "ash-spitter", assetId: "ember-wisp" },
  { id: "plague-lobber", assetId: "toxic-shroom" },
  { id: "iron-mauler", assetId: "stone-brute" },
  { id: "loot-runner", assetId: "fang-crawler" },
  { id: "charger-hulk", assetId: "stone-brute" },
  { id: "elite-spitter", assetId: "ember-wisp" },
  { id: "scrap-goliath", assetId: "scrap-goliath" },
  { id: "crimson-overlord", assetId: "crimson-overlord" }
] as const;
const weaponIds = [
  "cleaver",
  "coil-rifle",
  "ember-wand",
  "frost-orb",
  "gear-launcher",
  "halberd",
  "hunter-bow",
  "lance",
  "mace",
  "prism-scepter",
  "rust-blade",
  "scrap-smg",
  "spear",
  "spark-rod",
  "stick",
  "stone",
  "survivor-pistol",
  "twin-daggers",
  "venom-siphon",
  "war-hammer",
  "pitchfork"
] as const;

const arenaSurvivorBackgroundKeys: Record<ArenaSurvivorVisualTheme, string> = {
  classic: "arena-survivor-background",
  "obsidian-relay": "arena-survivor-background-obsidian-relay",
  "ironbound-dungeon": "arena-survivor-background-ironbound-dungeon"
};

export interface ArenaSurvivorAssetDescriptor {
  id: string;
  spriteKey: string;
  spritePath: string;
  portraitKey: string;
  portraitPath: string;
}

export const arenaSurvivorCharacterAssets: readonly ArenaSurvivorAssetDescriptor[] = characterAssetIds.map((entry) => ({
  id: entry.id,
  spriteKey: `arena-survivor-character-${entry.id}`,
  spritePath: `/arena-survivor/characters/sprites/${entry.assetId}.svg`,
  portraitKey: `arena-survivor-character-portrait-${entry.id}`,
  portraitPath: `/arena-survivor/characters/portraits/${entry.assetId}.svg`
}));

export const arenaSurvivorEnemyAssets: readonly ArenaSurvivorAssetDescriptor[] = enemyAssetIds.map((entry) => ({
  id: entry.id,
  spriteKey: `arena-survivor-enemy-${entry.id}`,
  spritePath: `/arena-survivor/enemies/sprites/${entry.assetId}.svg`,
  portraitKey: `arena-survivor-enemy-portrait-${entry.id}`,
  portraitPath: `/arena-survivor/enemies/portraits/${entry.assetId}.svg`
}));

export const arenaSurvivorWeaponCarryAssets: ReadonlyArray<{
  id: string;
  spriteKey: string;
  spritePath: string;
}> = weaponIds.map((id) => ({
  id,
  spriteKey: `arena-survivor-weapon-carry-${id}`,
  spritePath: `/arena-survivor/weapons/carry/${id}_carry.svg`
}));

const obsidianCharacterAssets: readonly ArenaSurvivorAssetDescriptor[] = characterAssetIds.map((entry) => {
  const assetId = resolveArenaSurvivorCharacterThemeAssetId(entry.id);
  return {
    id: entry.id,
    spriteKey: `arena-survivor-obsidian-character-${entry.id}`,
    spritePath: `/arena-survivor/themes/obsidian-relay/characters/${assetId}.svg`,
    portraitKey: `arena-survivor-obsidian-character-portrait-${entry.id}`,
    portraitPath: `/arena-survivor/themes/obsidian-relay/characters/${assetId}.svg`
  };
});

const obsidianEnemyAssets: readonly ArenaSurvivorAssetDescriptor[] = enemyAssetIds.map((entry) => {
  const assetId = resolveArenaSurvivorEnemyThemeAssetId(entry.id);
  return {
    id: entry.id,
    spriteKey: `arena-survivor-obsidian-enemy-${entry.id}`,
    spritePath: `/arena-survivor/themes/obsidian-relay/enemies/${assetId}.svg`,
    portraitKey: `arena-survivor-obsidian-enemy-portrait-${entry.id}`,
    portraitPath: `/arena-survivor/themes/obsidian-relay/enemies/${assetId}.svg`
  };
});

const obsidianWeaponCarryAssets = weaponIds.map((id) => ({
  id,
  spriteKey: `arena-survivor-obsidian-weapon-${id}`,
  spritePath: `/arena-survivor/themes/obsidian-relay/weapons/${resolveArenaSurvivorWeaponThemeAssetId(id)}.svg`
}));

const ironboundCharacterAssets: readonly ArenaSurvivorAssetDescriptor[] = characterAssetIds.map((entry) => {
  const assetId = resolveArenaSurvivorCharacterThemeAssetId(entry.id, "ironbound-dungeon");
  const assetPath = resolveArenaSurvivorThemeAssetPath("ironbound-dungeon", "characters", assetId);
  return {
    id: entry.id,
    spriteKey: `arena-survivor-ironbound-character-${entry.id}`,
    spritePath: assetPath,
    portraitKey: `arena-survivor-ironbound-character-portrait-${entry.id}`,
    portraitPath: assetPath
  };
});

const ironboundEnemyAssets: readonly ArenaSurvivorAssetDescriptor[] = enemyAssetIds.map((entry) => {
  const assetId = resolveArenaSurvivorEnemyThemeAssetId(entry.id, "ironbound-dungeon");
  const assetPath = resolveArenaSurvivorThemeAssetPath("ironbound-dungeon", "enemies", assetId);
  return {
    id: entry.id,
    spriteKey: `arena-survivor-ironbound-enemy-${entry.id}`,
    spritePath: assetPath,
    portraitKey: `arena-survivor-ironbound-enemy-portrait-${entry.id}`,
    portraitPath: assetPath
  };
});

const ironboundWeaponCarryAssets = weaponIds.map((id) => ({
  id,
  spriteKey: `arena-survivor-ironbound-weapon-${id}`,
  spritePath: resolveArenaSurvivorThemeAssetPath(
    "ironbound-dungeon",
    "weapons",
    resolveArenaSurvivorWeaponThemeAssetId(id, "ironbound-dungeon")
  )
}));

function loadArenaSurvivorImage(scene: Phaser.Scene, key: string, path: string): void {
  if (scene.textures.exists(key)) {
    return;
  }

  if (path.endsWith(".svg")) {
    scene.load.svg(key, path);
    return;
  }

  scene.load.image(key, path);
}

export function loadArenaSurvivorAssets(scene: Phaser.Scene): void {
  for (const asset of [
    ...arenaSurvivorCharacterAssets,
    ...arenaSurvivorEnemyAssets,
    ...obsidianCharacterAssets,
    ...obsidianEnemyAssets,
    ...ironboundCharacterAssets,
    ...ironboundEnemyAssets
  ]) {
    loadArenaSurvivorImage(scene, asset.spriteKey, asset.spritePath);
    loadArenaSurvivorImage(scene, asset.portraitKey, asset.portraitPath);
  }

  for (const asset of [
    ...arenaSurvivorWeaponCarryAssets,
    ...obsidianWeaponCarryAssets,
    ...ironboundWeaponCarryAssets
  ]) {
    loadArenaSurvivorImage(scene, asset.spriteKey, asset.spritePath);
  }

  if (!scene.textures.exists(arenaSurvivorBackgroundKeys.classic)) {
    scene.load.svg(arenaSurvivorBackgroundKeys.classic, "/arena-survivor/backgrounds/arena-field.svg");
  }

  if (!scene.textures.exists(arenaSurvivorBackgroundKeys["obsidian-relay"])) {
    scene.load.svg(
      arenaSurvivorBackgroundKeys["obsidian-relay"],
      "/arena-survivor/themes/obsidian-relay/backgrounds/relay-vault.svg"
    );
  }

  if (!scene.textures.exists(arenaSurvivorBackgroundKeys["ironbound-dungeon"])) {
    scene.load.image(
      arenaSurvivorBackgroundKeys["ironbound-dungeon"],
      "/arena-survivor/themes/ironbound-dungeon/backgrounds/crypt-floor.png"
    );
  }
}

function resolveCharacterAssetsForTheme(theme: ArenaSurvivorVisualTheme): readonly ArenaSurvivorAssetDescriptor[] {
  if (theme === "obsidian-relay") {
    return obsidianCharacterAssets;
  }
  if (theme === "ironbound-dungeon") {
    return ironboundCharacterAssets;
  }
  return arenaSurvivorCharacterAssets;
}

function resolveEnemyAssetsForTheme(theme: ArenaSurvivorVisualTheme): readonly ArenaSurvivorAssetDescriptor[] {
  if (theme === "obsidian-relay") {
    return obsidianEnemyAssets;
  }
  if (theme === "ironbound-dungeon") {
    return ironboundEnemyAssets;
  }
  return arenaSurvivorEnemyAssets;
}

export function resolveArenaSurvivorPlayerSpriteKey(
  characterId: string,
  theme: ArenaSurvivorVisualTheme = "classic"
): string {
  const assets = resolveCharacterAssetsForTheme(theme);
  const asset = assets.find((entry) => entry.id === characterId);
  return asset?.spriteKey ?? arenaSurvivorCharacterAssets[0].spriteKey;
}

export function resolveArenaSurvivorPlayerPortraitKey(
  characterId: string,
  theme: ArenaSurvivorVisualTheme = "classic"
): string {
  const assets = resolveCharacterAssetsForTheme(theme);
  const asset = assets.find((entry) => entry.id === characterId);
  return asset?.portraitKey ?? arenaSurvivorCharacterAssets[0].portraitKey;
}

export function resolveArenaSurvivorEnemySpriteKey(
  definitionId: string,
  theme: ArenaSurvivorVisualTheme = "classic"
): string | null {
  const assets = resolveEnemyAssetsForTheme(theme);
  const asset = assets.find((entry) => entry.id === definitionId);
  return asset?.spriteKey ?? null;
}

export function resolveArenaSurvivorEnemyPortraitKey(
  definitionId: string,
  theme: ArenaSurvivorVisualTheme = "classic"
): string | null {
  const assets = resolveEnemyAssetsForTheme(theme);
  const asset = assets.find((entry) => entry.id === definitionId);
  return asset?.portraitKey ?? null;
}

export function resolveArenaSurvivorWeaponCarrySpriteKey(
  weaponId: string,
  theme: ArenaSurvivorVisualTheme = "classic"
): string | null {
  const assets = theme === "obsidian-relay"
    ? obsidianWeaponCarryAssets
    : theme === "ironbound-dungeon"
      ? ironboundWeaponCarryAssets
      : arenaSurvivorWeaponCarryAssets;
  const asset = assets.find((entry) => entry.id === weaponId);
  return asset?.spriteKey ?? null;
}

export function resolveArenaSurvivorBackgroundKey(theme: ArenaSurvivorVisualTheme = "classic"): string {
  return arenaSurvivorBackgroundKeys[theme];
}

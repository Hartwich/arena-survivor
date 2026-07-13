import type { ArenaSurvivorVisualTheme } from "./protocol.js";

export const arenaSurvivorDefaultVisualTheme: ArenaSurvivorVisualTheme = "obsidian-relay";

export const arenaSurvivorVisualThemeOptions = [
  {
    id: "obsidian-relay",
    label: "Obsidian Relay",
    description: "Detaillierte Sci-Fi-Ruinen, Plasma, Kupfer und schwarzes Metall."
  },
  {
    id: "classic",
    label: "Classic Arena",
    description: "Das bisherige warme, organische Arena-Design."
  }
] as const;

const characterAssets: Record<string, string> = {
  "schrotto-scharfschuss": "relay-marksman",
  "jaeger-ranger": "relay-marksman",
  "kloppbert-keulenwucht": "relay-breaker",
  "pruegler-brawler": "relay-breaker",
  "funkenberta-flaemmchen": "relay-arcanist",
  "professor-paradox": "relay-arcanist",
  "kanni-baldrian": "relay-revenant",
  "doktor-knolle": "relay-medic",
  "sir-pampel-panzer": "relay-bastion",
  flitzelotte: "relay-courier",
  "gluecksknolle-lucky": "relay-courier",
  "rundling-allround": "relay-artificer",
  "ackerling-farmer": "relay-artificer"
};

const enemyAssets: Record<string, string> = {
  "slime-blob": "nano-swarm",
  "fang-crawler": "razor-drone",
  "needle-runner": "razor-drone",
  "stone-brute": "vault-warden",
  "shell-bulwark": "vault-warden",
  "ember-wisp": "plasma-wisp",
  "toxic-shroom": "spore-reactor",
  "ash-spitter": "plasma-wisp",
  "plague-lobber": "spore-reactor",
  "iron-mauler": "vault-warden",
  "loot-runner": "razor-drone",
  "charger-hulk": "vault-warden",
  "elite-spitter": "plasma-wisp",
  "scrap-goliath": "siege-construct",
  "crimson-overlord": "relay-sovereign"
};

const weaponAssets: Record<string, string> = {
  "rust-blade": "phase-blade",
  cleaver: "phase-blade",
  "twin-daggers": "twin-emitters",
  "war-hammer": "gravity-maul",
  mace: "gravity-maul",
  spear: "arc-polearm",
  lance: "arc-polearm",
  halberd: "arc-polearm",
  pitchfork: "arc-polearm",
  stick: "arc-polearm",
  stone: "singularity-orb",
  "frost-orb": "singularity-orb",
  "survivor-pistol": "pulse-carbine",
  "scrap-smg": "pulse-carbine",
  "coil-rifle": "pulse-carbine",
  "gear-launcher": "pulse-carbine",
  "hunter-bow": "photon-bow",
  "ember-wand": "conduit-scepter",
  "spark-rod": "conduit-scepter",
  "venom-siphon": "conduit-scepter",
  "prism-scepter": "conduit-scepter"
};

const itemAssets: Record<string, string> = {
  "mushroom-cap": "vital-module",
  "stone-heart": "vital-module",
  "herbal-bandage": "vital-module",
  "vampire-brooch": "vital-module",
  "iron-shell": "armor-module",
  "heavy-coat": "armor-module",
  "power-bracelet": "power-module",
  "berserker-feather": "power-module",
  "heavy-bullets": "power-module",
  "drill-core": "power-module",
  "glass-eye": "optic-module",
  "scope-lens": "optic-module",
  "blindfold": "optic-module",
  "trigger-glove": "motion-module",
  "runner-boots": "motion-module",
  "duelist-ribbon": "motion-module",
  "arcane-crystal": "arcane-module",
  "magnet-core": "arcane-module",
  "thorn-chain": "arcane-module",
  medal: "fortune-module",
  "lucky-charm": "fortune-module",
  "harvest-sprout": "fortune-module"
};

export function isArenaSurvivorVisualTheme(value: unknown): value is ArenaSurvivorVisualTheme {
  return value === "classic" || value === "obsidian-relay";
}

export function resolveArenaSurvivorCharacterThemeAssetId(characterId: string): string {
  return characterAssets[characterId] ?? "relay-artificer";
}

export function resolveArenaSurvivorEnemyThemeAssetId(enemyId: string): string {
  return enemyAssets[enemyId] ?? "nano-swarm";
}

export function resolveArenaSurvivorWeaponThemeAssetId(weaponId: string): string {
  return weaponAssets[weaponId] ?? "pulse-carbine";
}

export function resolveArenaSurvivorItemThemeAssetId(itemId: string): string {
  return itemAssets[itemId] ?? "arcane-module";
}

export function resolveArenaSurvivorCharacterPortraitPath(
  characterId: string,
  theme: ArenaSurvivorVisualTheme
): string {
  return theme === "obsidian-relay"
    ? `/arena-survivor/themes/obsidian-relay/characters/${resolveArenaSurvivorCharacterThemeAssetId(characterId)}.svg`
    : `/arena-survivor/characters/portraits/${characterId}.svg`;
}

export function resolveArenaSurvivorShopIconPath(
  kind: "item" | "weapon",
  id: string,
  theme: ArenaSurvivorVisualTheme
): string {
  if (theme === "classic") {
    return kind === "weapon"
      ? `/arena-survivor/weapons/shop/${id}.svg`
      : `/arena-survivor/item-icons/${id}.svg`;
  }

  const assetId = kind === "weapon"
    ? resolveArenaSurvivorWeaponThemeAssetId(id)
    : resolveArenaSurvivorItemThemeAssetId(id);
  return `/arena-survivor/themes/obsidian-relay/${kind === "weapon" ? "weapons" : "items"}/${assetId}.svg`;
}

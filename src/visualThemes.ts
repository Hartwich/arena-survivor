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
  "jaeger-ranger": "relay-ranger",
  "kloppbert-keulenwucht": "relay-breaker",
  "pruegler-brawler": "relay-brawler",
  "funkenberta-flaemmchen": "relay-arcanist",
  "professor-paradox": "relay-paradox",
  "kanni-baldrian": "relay-revenant",
  "doktor-knolle": "relay-medic",
  "sir-pampel-panzer": "relay-bastion",
  flitzelotte: "relay-courier",
  "gluecksknolle-lucky": "relay-fortune",
  "rundling-allround": "relay-artificer",
  "ackerling-farmer": "relay-harvester"
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
  cleaver: "plasma-cleaver",
  "twin-daggers": "twin-emitters",
  "war-hammer": "gravity-maul",
  mace: "shock-mace",
  spear: "arc-polearm",
  lance: "rail-lance",
  halberd: "crescent-halberd",
  pitchfork: "trident-array",
  stick: "conductor-rod",
  stone: "singularity-orb",
  "frost-orb": "cryo-orb",
  "survivor-pistol": "pulse-carbine",
  "scrap-smg": "ion-smg",
  "coil-rifle": "coil-accelerator",
  "gear-launcher": "disc-launcher",
  "hunter-bow": "photon-bow",
  "ember-wand": "conduit-scepter",
  "spark-rod": "tesla-rod",
  "venom-siphon": "toxin-siphon",
  "prism-scepter": "prism-focus"
};

const itemAssets: Record<string, string> = {
  "mushroom-cap": "vital-module",
  "stone-heart": "stone-heart",
  "herbal-bandage": "herbal-bandage",
  "vampire-brooch": "vampire-brooch",
  "iron-shell": "armor-module",
  "heavy-coat": "heavy-coat",
  "power-bracelet": "power-module",
  "berserker-feather": "berserker-feather",
  "heavy-bullets": "heavy-bullets",
  "drill-core": "drill-core",
  "glass-eye": "optic-module",
  "scope-lens": "scope-lens",
  "blindfold": "blindfold",
  "trigger-glove": "motion-module",
  "runner-boots": "runner-boots",
  "duelist-ribbon": "duelist-ribbon",
  "arcane-crystal": "arcane-module",
  "magnet-core": "magnet-core",
  "thorn-chain": "thorn-chain",
  medal: "fortune-module",
  "lucky-charm": "lucky-charm",
  "harvest-sprout": "harvest-sprout"
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

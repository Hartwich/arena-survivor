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
  },
  {
    id: "ironbound-dungeon",
    label: "Ironbound Dungeon",
    description: "Hochaufloesende CC0-Dungeon-Grafiken, violetter Stein, Gold und klassische Fantasy."
  },
  {
    id: "frostfire-saga",
    label: "Frostfire Saga",
    description: "Handgemalte nordische Storybook-Welt mit Eis, Glut, Runen und geschnitztem Holz."
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

const ironboundCharacterAssets: Record<string, string> = {
  "schrotto-scharfschuss": "schrotto-scharfschuss",
  "jaeger-ranger": "jaeger-ranger",
  "kloppbert-keulenwucht": "kloppbert-keulenwucht",
  "pruegler-brawler": "pruegler-brawler",
  "funkenberta-flaemmchen": "funkenberta-flaemmchen",
  "professor-paradox": "professor-paradox",
  "kanni-baldrian": "kanni-baldrian",
  "doktor-knolle": "doktor-knolle",
  "sir-pampel-panzer": "sir-pampel-panzer",
  flitzelotte: "flitzelotte",
  "gluecksknolle-lucky": "gluecksknolle-lucky",
  "rundling-allround": "rundling-allround",
  "ackerling-farmer": "ackerling-farmer"
};

const ironboundEnemyAssets: Record<string, string> = {
  "slime-blob": "shade-scorpion",
  "fang-crawler": "night-scarab",
  "needle-runner": "shade-scorpion",
  "stone-brute": "stone-horror",
  "shell-bulwark": "stone-horror",
  "ember-wisp": "vault-eye",
  "toxic-shroom": "bone-serpent",
  "ash-spitter": "vault-eye",
  "plague-lobber": "bone-serpent",
  "iron-mauler": "grave-skeleton",
  "loot-runner": "crypt-goblin",
  "charger-hulk": "night-scarab",
  "elite-spitter": "vault-eye",
  "scrap-goliath": "grave-skeleton",
  "crimson-overlord": "vault-eye"
};

const ironboundWeaponAssets: Record<string, string> = Object.fromEntries(
  Object.keys(weaponAssets).map((id) => [id, id])
);

const ironboundItemAssets: Record<string, string> = Object.fromEntries(
  Object.keys(itemAssets).map((id) => [id, id])
);

const frostfireCharacterAssets = ironboundCharacterAssets;

const frostfireEnemyAssets: Record<string, string> = {
  "slime-blob": "frost-slime",
  "fang-crawler": "frost-wolf",
  "needle-runner": "frost-wolf",
  "stone-brute": "rune-troll",
  "shell-bulwark": "rune-troll",
  "ember-wisp": "ember-spirit",
  "toxic-shroom": "venom-shroom",
  "ash-spitter": "ember-spirit",
  "plague-lobber": "venom-shroom",
  "iron-mauler": "rune-troll",
  "loot-runner": "frost-slime",
  "charger-hulk": "frost-wolf",
  "elite-spitter": "ember-spirit",
  "scrap-goliath": "timber-golem",
  "crimson-overlord": "frostfire-dragon"
};

const frostfireWeaponAssets = ironboundWeaponAssets;
const frostfireItemAssets = ironboundItemAssets;

type ArenaSurvivorAlternateVisualTheme = Exclude<ArenaSurvivorVisualTheme, "classic">;

export function isArenaSurvivorVisualTheme(value: unknown): value is ArenaSurvivorVisualTheme {
  return value === "classic"
    || value === "obsidian-relay"
    || value === "ironbound-dungeon"
    || value === "frostfire-saga";
}

export function resolveArenaSurvivorCharacterThemeAssetId(
  characterId: string,
  theme: ArenaSurvivorAlternateVisualTheme = "obsidian-relay"
): string {
  if (theme === "frostfire-saga") {
    return frostfireCharacterAssets[characterId] ?? "rundling-allround";
  }
  if (theme === "ironbound-dungeon") {
    return ironboundCharacterAssets[characterId] ?? "rundling-allround";
  }
  return characterAssets[characterId] ?? "relay-artificer";
}

export function resolveArenaSurvivorEnemyThemeAssetId(
  enemyId: string,
  theme: ArenaSurvivorAlternateVisualTheme = "obsidian-relay"
): string {
  if (theme === "frostfire-saga") {
    return frostfireEnemyAssets[enemyId] ?? "frost-slime";
  }
  if (theme === "ironbound-dungeon") {
    return ironboundEnemyAssets[enemyId] ?? "shade-scorpion";
  }
  return enemyAssets[enemyId] ?? "nano-swarm";
}

export function resolveArenaSurvivorWeaponThemeAssetId(
  weaponId: string,
  theme: ArenaSurvivorAlternateVisualTheme = "obsidian-relay"
): string {
  if (theme === "frostfire-saga") {
    return frostfireWeaponAssets[weaponId] ?? "rust-blade";
  }
  if (theme === "ironbound-dungeon") {
    return ironboundWeaponAssets[weaponId] ?? "rust-blade";
  }
  return weaponAssets[weaponId] ?? "pulse-carbine";
}

export function resolveArenaSurvivorItemThemeAssetId(
  itemId: string,
  theme: ArenaSurvivorAlternateVisualTheme = "obsidian-relay"
): string {
  if (theme === "frostfire-saga") {
    return frostfireItemAssets[itemId] ?? "arcane-crystal";
  }
  if (theme === "ironbound-dungeon") {
    return ironboundItemAssets[itemId] ?? "arcane-crystal";
  }
  return itemAssets[itemId] ?? "arcane-module";
}

export function resolveArenaSurvivorThemeAssetPath(
  theme: ArenaSurvivorAlternateVisualTheme,
  category: "characters" | "enemies" | "weapons" | "items",
  assetId: string
): string {
  const extension = theme === "obsidian-relay" ? "svg" : "png";
  return `/arena-survivor/themes/${theme}/${category}/${assetId}.${extension}`;
}

export function resolveArenaSurvivorCharacterPortraitPath(
  characterId: string,
  theme: ArenaSurvivorVisualTheme
): string {
  if (theme === "classic") {
    return `/arena-survivor/characters/portraits/${characterId}.svg`;
  }

  return resolveArenaSurvivorThemeAssetPath(
    theme,
    "characters",
    resolveArenaSurvivorCharacterThemeAssetId(characterId, theme)
  );
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
    ? resolveArenaSurvivorWeaponThemeAssetId(id, theme)
    : resolveArenaSurvivorItemThemeAssetId(id, theme);
  return resolveArenaSurvivorThemeAssetPath(
    theme,
    kind === "weapon" ? "weapons" : "items",
    assetId
  );
}

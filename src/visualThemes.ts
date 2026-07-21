import type { ArenaSurvivorVisualTheme } from "./protocol.js";

export const arenaSurvivorDefaultVisualTheme: ArenaSurvivorVisualTheme = "frostfire-saga";

export const arenaSurvivorVisualThemeOptions = [
  {
    id: "frostfire-saga",
    label: "Frostfire Saga",
    description: "Handgemalte nordische Storybook-Welt mit Eis, Glut, Runen und geschnitztem Holz."
  },
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

const frostfireCharacterAssets: Record<string, string> = {
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

const frostfireWeaponAssets: Record<string, string> = Object.fromEntries(
  Object.keys(weaponAssets).map((id) => [id, id])
);

const frostfireItemAssets: Record<string, string> = Object.fromEntries(
  Object.keys(itemAssets).map((id) => [id, id])
);

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

type ArenaSurvivorAlternateVisualTheme = Exclude<ArenaSurvivorVisualTheme, "classic">;

export function isArenaSurvivorVisualTheme(value: unknown): value is ArenaSurvivorVisualTheme {
  return value === "classic"
    || value === "obsidian-relay"
    || value === "frostfire-saga";
}

export function resolveArenaSurvivorCharacterThemeAssetId(
  characterId: string,
  theme: ArenaSurvivorAlternateVisualTheme = "obsidian-relay"
): string {
  if (theme === "frostfire-saga") {
    return frostfireCharacterAssets[characterId] ?? "rundling-allround";
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
  return enemyAssets[enemyId] ?? "nano-swarm";
}

export function resolveArenaSurvivorWeaponThemeAssetId(
  weaponId: string,
  theme: ArenaSurvivorAlternateVisualTheme = "obsidian-relay"
): string {
  if (theme === "frostfire-saga") {
    return frostfireWeaponAssets[weaponId] ?? "rust-blade";
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
    return `/arena-survivor/themes/classic/characters/portraits/${characterId}.svg`;
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
      ? `/arena-survivor/themes/classic/weapons/shop/${id}.svg`
      : `/arena-survivor/themes/classic/items/${id}.svg`;
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

export function resolveArenaSurvivorLevelBonusIconPath(
  bonusId: string,
  theme: ArenaSurvivorVisualTheme
): string | undefined {
  return theme === "frostfire-saga"
    ? `/arena-survivor/themes/frostfire-saga/upgrades/${bonusId}.png`
    : undefined;
}

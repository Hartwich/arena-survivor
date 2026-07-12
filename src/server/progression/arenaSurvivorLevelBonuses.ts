import type {
  ArenaSurvivorShopOfferState,
  ArenaSurvivorShopState,
  ArenaSurvivorStatModifiers
} from "../../protocol.js";
import { createSeededRandom, type ArenaSurvivorRuntimePlayerState } from "../arenaSurvivorState.js";

interface ArenaSurvivorLevelBonusDefinition {
  id: string;
  title: { de: string; en: string };
  description: { de: string; en: string };
  detail: { de: string; en: string };
  modifiers: ArenaSurvivorStatModifiers;
}

const levelBonusDefinitions: ArenaSurvivorLevelBonusDefinition[] = [
  { id: "damage", title: { de: "Mehr Schaden", en: "More Damage" }, description: { de: "+3% Schaden", en: "+3% damage" }, detail: { de: "Schaden", en: "Damage" }, modifiers: { damagePct: 3 } },
  { id: "range", title: { de: "Mehr Reichweite", en: "More Range" }, description: { de: "+20% Waffenreichweite", en: "+20% weapon range" }, detail: { de: "Reichweite", en: "Range" }, modifiers: { weaponRangePct: 20 } },
  { id: "crit", title: { de: "Kritische Chance", en: "Critical Chance" }, description: { de: "+1% kritische Trefferchance", en: "+1% critical hit chance" }, detail: { de: "Krit", en: "Crit" }, modifiers: { critChancePct: 1 } },
  { id: "attack-speed", title: { de: "Schnellere Angriffe", en: "Faster Attacks" }, description: { de: "+3% Angriffsgeschwindigkeit", en: "+3% attack speed" }, detail: { de: "Angriffstempo", en: "Attack speed" }, modifiers: { attackSpeedPct: 3 } },
  { id: "max-health", title: { de: "Mehr Leben", en: "More Health" }, description: { de: "+5 maximales Leben", en: "+5 maximum health" }, detail: { de: "Max. Leben", en: "Max health" }, modifiers: { maxHp: 5 } },
  { id: "armor", title: { de: "Mehr Ruestung", en: "More Armor" }, description: { de: "+1 Ruestung", en: "+1 armor" }, detail: { de: "Ruestung", en: "Armor" }, modifiers: { armor: 1 } },
  { id: "move-speed", title: { de: "Mehr Tempo", en: "More Speed" }, description: { de: "+3% Bewegungstempo", en: "+3% movement speed" }, detail: { de: "Tempo", en: "Speed" }, modifiers: { moveSpeedPct: 3 } },
  { id: "life-steal", title: { de: "Lebensraub", en: "Life Steal" }, description: { de: "+1% Lebensraub", en: "+1% life steal" }, detail: { de: "Lebensraub", en: "Life steal" }, modifiers: { lifeStealPct: 1 } }
];

export function createArenaSurvivorLevelUpShopState(
  player: ArenaSurvivorRuntimePlayerState,
  seed: number,
  language?: "de" | "en"
): { shop: ArenaSurvivorShopState; seed: number } {
  const languageKey = language === "en" ? "en" : "de";
  const remainingDefinitions = [...levelBonusDefinitions];
  const offers: ArenaSurvivorShopOfferState[] = [];
  let nextSeed = seed;

  while (offers.length < 4 && remainingDefinitions.length > 0) {
    const random = createSeededRandom(nextSeed);
    nextSeed = random.seed;
    const definitionIndex = Math.min(remainingDefinitions.length - 1, Math.floor(random.value * remainingDefinitions.length));
    const [definition] = remainingDefinitions.splice(definitionIndex, 1);

    offers.push({
      id: `level-bonus:${player.level}:${player.pendingLevelUpChoices}:${definition.id}`,
      kind: "upgrade",
      title: definition.title[languageKey],
      description: definition.description[languageKey],
      cost: 0,
      affordable: true,
      purchased: false,
      targetLevel: player.level - player.pendingLevelUpChoices + 1,
      levelBonusModifiers: { ...definition.modifiers },
      tags: [languageKey === "en" ? "Level bonus" : "Level-Bonus"],
      summary: definition.description[languageKey],
      detailLines: [{ label: definition.detail[languageKey], value: definition.description[languageKey] }]
    });
  }

  return {
    seed: nextSeed,
    shop: {
      mode: "level_up",
      available: offers.length > 0,
      offers,
      message: languageKey === "en" ? "Choose one bonus for this level." : "Waehle einen Bonus fuer dieses Level.",
      rerollCount: 0,
      rerollCost: 0,
      canReroll: false
    }
  };
}

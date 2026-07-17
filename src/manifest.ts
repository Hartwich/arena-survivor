import type { GameManifest } from "@open-party-lab/game-core";
import { arenaSurvivorRoomSettingKeys } from "./server/arenaSurvivorConfig.js";
import { arenaSurvivorCharacterDefinitions } from "./server/definitions/characterDefinitions.js";
import { arenaSurvivorSetupConfig } from "./protocol.js";
import {
  arenaSurvivorDefaultVisualTheme,
  arenaSurvivorVisualThemeOptions,
  resolveArenaSurvivorCharacterPortraitPath
} from "./visualThemes.js";

export const arenaSurvivorManifest = {
  id: "arena-survivor",
  displayName: "Arena Survivor",
  description: "Ueberlebe in der Arena gegen immer neue Gegner.",
  minPlayers: 1,
  maxPlayers: 4,
  hostView: "ArenaSurvivorHostScene",
  controllerView: "arena-survivor",
  controllerLayout: "virtual_joystick",
  supportsTeams: false,
  estimatedRoundDurationMs: 45_000,
  roundCompletionMode: "wait_for_ready",
  lobbySetup: {
    title: "Run Setup",
    description: "Lege die Schwierigkeit fest und gib den Run frei.",
    fields: [
      {
        kind: "select",
        id: "visualTheme",
        settingKey: arenaSurvivorRoomSettingKeys.visualTheme,
        actionKey: "visualTheme",
        label: "Art Design",
        description: "Waehle das komplette visuelle Set fuer Map, Figuren, Gegner und Ausruestung.",
        options: arenaSurvivorVisualThemeOptions,
        defaultValue: arenaSurvivorSetupConfig.visualTheme.defaultValue
      },
      {
        kind: "number",
        id: "difficulty",
        settingKey: arenaSurvivorRoomSettingKeys.difficultyTier,
        actionKey: "difficulty",
        label: "Schwierigkeit",
        description: "Gefahr 1 bis 5.",
        min: arenaSurvivorSetupConfig.difficulty.min,
        max: arenaSurvivorSetupConfig.difficulty.max,
        step: arenaSurvivorSetupConfig.difficulty.step,
        defaultValue: arenaSurvivorSetupConfig.difficulty.defaultValue
      }
    ],
    confirmation: {
      settingKey: arenaSurvivorRoomSettingKeys.setupConfirmed,
      actionType: "confirm-lobby",
      label: "Run freigeben",
      description: "Startet automatisch, sobald alle Spieler bereit sind."
    }
  },
  playerSetup: {
    kind: "choice",
    title: "Charakterwahl",
    description: "Waehle deinen Charakter fuer den Run.",
    required: true,
    options: arenaSurvivorCharacterDefinitions.map((character) => ({
      id: character.id,
      name: character.name,
      title: character.title,
      archetype: character.archetype,
      description: character.description,
      portraitPath: resolveArenaSurvivorCharacterPortraitPath(character.id, arenaSurvivorDefaultVisualTheme),
      portraitPathBySetting: {
        settingKey: arenaSurvivorRoomSettingKeys.visualTheme,
        values: Object.fromEntries(
          arenaSurvivorVisualThemeOptions.map((theme) => [
            theme.id,
            resolveArenaSurvivorCharacterPortraitPath(character.id, theme.id)
          ])
        )
      },
      visual: {
        primaryColor: character.visual.primaryColor,
        secondaryColor: character.visual.secondaryColor,
        accentColor: character.visual.accentColor
      }
    }))
  },
  phaseDurations: {
    roundIntroMs: 1_500,
    countdownMs: 2_000,
    resultMs: 4_000,
    scoreboardMs: 4_000
  }
} as const satisfies GameManifest;

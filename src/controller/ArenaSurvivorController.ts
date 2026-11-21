import { getArenaSurvivorContentText } from "../contentText.js";
import type { SupportedLanguage } from "@open-party-lab/game-core";
import type {
  ArenaSurvivorPlayerState,
  ArenaSurvivorShopOfferState,
  ArenaSurvivorState,
  ArenaSurvivorVisualTheme
} from "../protocol.js";
import {
  resolveArenaSurvivorLevelBonusIconPath,
  resolveArenaSurvivorShopIconPath
} from "../visualThemes.js";
import {
  createArenaSurvivorMoveInput,
  createArenaSurvivorShopInput,
  createArenaSurvivorShopCombineInput,
  createArenaSurvivorShopRerollInput,
  createArenaSurvivorShopSellInput
} from "./arenaSurvivorBindings.js";

interface LayoutStat {
  label: string;
  value: string;
  highlighted?: boolean;
}

interface ReadyLayoutModel {
  currentPlayerReady: boolean;
  readyCount: number;
  playerCount: number;
  label: string;
  description?: string;
  language?: SupportedLanguage;
  onToggleReady: () => void;
}

interface ShopOfferModel {
  id: string;
  kind: "item" | "weapon" | "upgrade";
  title: string;
  description: string;
  cost: number;
  affordable: boolean;
  purchased: boolean;
  iconPath?: string;
  targetLevel?: number;
  summary?: string;
  stats?: LayoutStat[];
  tags?: string[];
  detailLines?: Array<{
    label: string;
    value: string;
  }>;
}

interface ArenaSurvivorModernShopLayoutModel {
  survival?: { phase: string; cores: number; level: number };
  kind: "arena_survivor_modern_shop";
  title: string;
  subtitle?: string;
  helperText?: string;
  language?: SupportedLanguage;
  disabled: boolean;
  accentColor?: string;
  shopMode?: "regular" | "level_up";
  levelUpChoicesRemaining?: number;
  waveNumber: number;
  materials: number;
  ready?: ReadyLayoutModel;
  reroll?: {
    cost: number;
    count: number;
    affordable: boolean;
    onReroll: () => void;
  };
  loadout?: {
    weapons: Array<{
      weaponInstanceId: string;
      weaponId: string;
      level: number;
      maxLevel: number;
      displayName: string;
      description: string;
      iconPath?: string;
      sellValue?: number;
      sellable?: boolean;
      canCombine?: boolean;
      stats?: LayoutStat[];
    }>;
    items: Array<{
      itemId: string;
      level: number;
      displayName: string;
      description?: string;
      iconPath?: string;
    }>;
  };
  runSummary?: {
    wavesCleared: number;
    totalKills: number;
    totalMaterialsCollected: number;
    totalSurvivedMs: number;
  };
  playerStats?: Array<{
    label: string;
    value: string;
  }>;
  offers: ShopOfferModel[];
  onBuy: (offerId: string) => void;
  onSellWeapon?: (weaponInstanceId: string) => void;
  onCombineWeapon?: (weaponInstanceId: string) => void;
}

interface VirtualJoystickLayoutModel {
  kind: "virtual_joystick";
  title: string;
  subtitle?: string;
  helperText?: string;
  minimal?: boolean;
  stickPlacement?: "center" | "bottom" | "lower-middle";
  disabled: boolean;
  accentColor?: string;
  resetKey: string;
  centerLabel?: string;
  ready?: ReadyLayoutModel;
  stats?: LayoutStat[];
  onMoveChange: (moveX: number, moveY: number) => void;
}

interface ControllerGameRenderContext {
  state: {
    room?: {
      language?: SupportedLanguage;
      selectedGameId?: string;
      players?: Array<{ id: string; name: string; isReady?: boolean }>;
    } | null;
    player?: {
      id: string;
      color?: string;
      isReady?: boolean;
    } | null;
    game?: {
      phase?: string;
      roundNumber?: number;
      state?: unknown;
    } | null;
  };
  onInput(input: unknown): void;
  onSetReady?: (isReady: boolean) => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatRoundedHp(value: number | null | undefined): string {
  return `${Math.max(0, Math.round(value ?? 0))}`;
}

function formatPercent(value: number | null | undefined): string {
  const safeValue = Math.max(0, value ?? 0);
  return `${safeValue >= 10 ? Math.round(safeValue) : Math.round(safeValue * 10) / 10}%`;
}

function shouldHighlightOfferStat(label: string, index: number): boolean {
  return index === 0 || /crit|schaden|damage|projektil|projectile|reichweite|range/i.test(label);
}

function buildOfferStats(offer: ArenaSurvivorShopOfferState): LayoutStat[] {
  if (!offer.detailLines?.length) {
    return [];
  }

  return offer.detailLines.map((detailLine, index) => ({
    label: detailLine.label,
    value: detailLine.value,
    highlighted: shouldHighlightOfferStat(detailLine.label, index)
  }));
}

function enrichArenaSurvivorShopOffers(
  offers: ArenaSurvivorShopOfferState[],
  visualTheme: ArenaSurvivorVisualTheme
): ShopOfferModel[] {
  return offers.map((offer) => {
    const stats = buildOfferStats(offer);
    const iconPath = offer.kind === "weapon" && offer.weaponId
      ? resolveArenaSurvivorShopIconPath("weapon", offer.weaponId, visualTheme)
      : offer.kind === "item" && offer.itemId
        ? resolveArenaSurvivorShopIconPath("item", offer.itemId, visualTheme)
        : offer.kind === "upgrade" && offer.levelBonusId
          ? resolveArenaSurvivorLevelBonusIconPath(offer.levelBonusId, visualTheme)
        : offer.iconPath;
    const themedOffer = { ...offer, iconPath };

    return stats.length > 0 ? { ...themedOffer, stats } : themedOffer;
  });
}

function buildLoadoutWeaponStats(
  detailLines: ArenaSurvivorPlayerState["loadout"]["weapons"][number]["detailLines"]
): LayoutStat[] {
  return (
    detailLines?.map((detailLine, index) => ({
      label: detailLine.label,
      value: detailLine.value,
      highlighted: index === 0 || detailLine.label === "Crit" || detailLine.label === "Projektile"
    })) ?? []
  );
}

function resolveCurrentPlayer(
  context: ControllerGameRenderContext,
  state: ArenaSurvivorState | null
): ArenaSurvivorPlayerState | null {
  const playerId = context.state.player?.id;

  if (!playerId || !state) {
    return null;
  }

  return state.players.find((player) => player.playerId === playerId) ?? null;
}

function formatStatus(player: ArenaSurvivorPlayerState | null, state: ArenaSurvivorState | null, language: SupportedLanguage): string {
  const words = {
    de: ["Wartet", "Gewonnen", "Verloren", "Ausgeschieden", "Aktiv"], en: ["Waiting", "Won", "Lost", "Out", "Active"],
    es: ["Esperando", "Ganaste", "Perdiste", "Eliminado", "Activo"], fr: ["En attente", "Gagné", "Perdu", "Éliminé", "Actif"],
    "pt-BR": ["Aguardando", "Vitória", "Derrota", "Eliminado", "Ativo"]
  }[language];
  if (!player || !state) {
    return words[0];
  }

  if (state.result.outcome === "survived") {
    return words[1];
  }

  if (state.result.outcome === "defeated") {
    return words[2];
  }

  if (!player.alive) {
    return words[3];
  }

  return words[4];
}

function resolvePlayerStats(player: ArenaSurvivorPlayerState | null, language?: SupportedLanguage): Array<{ label: string; value: string }> {
  if (!player) {
    return [];
  }

  const stats = player.stats;

  return [
    { label: "Move Speed", value: `${Math.round(stats.moveSpeed)}` },
    { label: "Max HP", value: formatRoundedHp(stats.maxHp) },
    { label: "Proj Dmg", value: `${Math.round(stats.projectileDamageMultiplier * 100)}%` },
    { label: "Fire Rate", value: `${Math.round(stats.autoFireRateMultiplier * 100)}%` },
    { label: "Armor", value: `${Math.round((stats.armor ?? 0) * 100) / 100}` },
    { label: "Dodge", value: formatPercent(stats.dodgePct) },
    { label: "Crit", value: `${Math.round(stats.critChancePct ?? 0)}%` },
    { label: "Atk Spd", value: `${Math.round((stats.attackSpeedMultiplier ?? 1) * 100)}%` },
    { label: "Range", value: `${Math.round((stats.weaponRangeMultiplier ?? 1) * 100)}%` },
    { label: "Luck", value: `${Math.round(stats.luck ?? 0)}` },
    { label: "Harvest", value: `${Math.round(stats.harvesting ?? 0)}` },
    { label: "Life Steal", value: formatPercent(stats.lifeStealPct) },
    { label: "Regen", value: `${Math.round((stats.hpRegen ?? 0) * 10) / 10}` }
  ].map((stat) => ({ ...stat, label: getArenaSurvivorContentText(stat.label, language) }));
}

function buildArenaSurvivorShopModel(
  context: ControllerGameRenderContext,
  state: ArenaSurvivorState,
  player: ArenaSurvivorPlayerState
): ArenaSurvivorModernShopLayoutModel {
  const currentPlayerReady = Boolean(context.state.player?.isReady);
  const language = context.state.room?.language;
  const en = language !== "de";
  const words = {
    de: { levelUp: "Level-Up", choice: "Wahl", choices: "Wahlen", remaining: "Noch", wave: "Welle", material: "Material", choose: "Wähle für jedes verdiente Level einen von vier zufälligen Boni.", waiting: (r: number, p: number) => `Warte auf alle Spieler. ${r}/${p} bereit.`, upgrades: "Wähle deine Upgrades für die nächste Welle.", soon: "Bereitmeldung abgeschlossen. Die nächste Welle startet gleich.", next: "Nächste Welle", buyReady: "Kaufe Upgrades und melde dich dann bereit.", allReady: "Alle sind bereit. Die nächste Welle startet automatisch." },
    en: { levelUp: "Level Up", choice: "choice", choices: "choices", remaining: "", wave: "Wave", material: "Materials", choose: "Choose one of four random bonuses for each earned level.", waiting: (r: number, p: number) => `Waiting for all players. ${r}/${p} ready.`, upgrades: "Choose your upgrades for the next wave.", soon: "Ready check complete. The next wave starts soon.", next: "Next Wave", buyReady: "Buy upgrades, then ready up.", allReady: "Everyone is ready. The next wave starts automatically." },
    es: { levelUp: "Subida de nivel", choice: "elección", choices: "elecciones", remaining: "Quedan", wave: "Oleada", material: "Materiales", choose: "Elige uno de cuatro bonus aleatorios por cada nivel obtenido.", waiting: (r: number, p: number) => `Esperando a todos. ${r}/${p} listos.`, upgrades: "Elige tus mejoras para la siguiente oleada.", soon: "Todos listos. La siguiente oleada empieza pronto.", next: "Siguiente oleada", buyReady: "Compra mejoras y luego marca que estás listo.", allReady: "Todos están listos. La siguiente oleada empieza automáticamente." },
    fr: { levelUp: "Niveau supérieur", choice: "choix", choices: "choix", remaining: "Restant", wave: "Vague", material: "Matériaux", choose: "Choisis un bonus parmi quatre options aléatoires pour chaque niveau gagné.", waiting: (r: number, p: number) => `En attente de tous. ${r}/${p} prêts.`, upgrades: "Choisis tes améliorations pour la prochaine vague.", soon: "Tout le monde est prêt. La prochaine vague commence bientôt.", next: "Vague suivante", buyReady: "Achète des améliorations, puis indique que tu es prêt.", allReady: "Tout le monde est prêt. La prochaine vague démarre automatiquement." },
    "pt-BR": { levelUp: "Subiu de nível", choice: "escolha", choices: "escolhas", remaining: "Restam", wave: "Onda", material: "Materiais", choose: "Escolha um entre quatro bônus aleatórios para cada nível conquistado.", waiting: (r: number, p: number) => `Aguardando todos. ${r}/${p} prontos.`, upgrades: "Escolha melhorias para a próxima onda.", soon: "Todos prontos. A próxima onda começa em breve.", next: "Próxima onda", buyReady: "Compre melhorias e depois confirme que está pronto.", allReady: "Todos estão prontos. A próxima onda começa automaticamente." }
  }[language ?? "de"];
  const playerCount = context.state.room?.players?.length ?? 0;
  const readyCount = (context.state.room?.players ?? []).filter((roomPlayer) => roomPlayer.isReady).length;
  const waitingForPlayers = readyCount < playerCount;
  const choosingLevelBonus = player.shop.mode === "level_up";
  const combineCounts = player.loadout.weapons.reduce((counts, weapon) => {
    const key = `${weapon.weaponId}:${weapon.level}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());

  return {
    kind: "arena_survivor_modern_shop",
    language,
    title: choosingLevelBonus
      ? `${player.name} ${words.levelUp}`
      : `${player.name} Shop`,
    subtitle: choosingLevelBonus
      ? language === "en" ? `${player.pendingLevelUpChoices} bonus ${player.pendingLevelUpChoices === 1 ? words.choice : words.choices} remaining` : `${words.remaining} ${player.pendingLevelUpChoices} Bonus-${player.pendingLevelUpChoices === 1 ? words.choice : words.choices}`
      : `${words.wave} ${state.waveNumber} | ${words.material} ${player.materials}`,
    helperText:
      choosingLevelBonus
        ? words.choose
        : waitingForPlayers
          ? words.waiting(readyCount, playerCount)
        : player.shop.available
          ? words.upgrades
          : words.soon,
    disabled: false,
    accentColor: player.color,
    shopMode: player.shop.mode,
    levelUpChoicesRemaining: choosingLevelBonus ? player.pendingLevelUpChoices : undefined,
    waveNumber: state.waveNumber,
    materials: player.materials,
    ready: context.onSetReady && !choosingLevelBonus
      ? {
          currentPlayerReady,
          readyCount,
          playerCount,
          language,
          label: words.next,
          description: waitingForPlayers
            ? words.buyReady
            : words.allReady,
          onToggleReady: () => {
            context.onSetReady?.(!currentPlayerReady);
          }
        }
      : undefined,
    reroll: choosingLevelBonus ? undefined : {
      cost: player.shop.rerollCost,
      count: player.shop.rerollCount,
      affordable: player.shop.canReroll,
      onReroll: () => {
        if (!player.playerId) {
          return;
        }

        context.onInput(createArenaSurvivorShopRerollInput(player.playerId));
      }
    },
    loadout: choosingLevelBonus ? undefined : {
      weapons: player.loadout.weapons.map((weapon) => ({
        weaponInstanceId: weapon.weaponInstanceId,
        weaponId: weapon.weaponId,
        level: weapon.level,
        maxLevel: weapon.maxLevel,
        displayName: weapon.displayName,
        description: weapon.description,
        iconPath: resolveArenaSurvivorShopIconPath("weapon", weapon.weaponId, state.visualTheme),
        sellValue: weapon.sellValue,
        sellable: weapon.sellable,
        canCombine:
          weapon.level < weapon.maxLevel &&
          (combineCounts.get(`${weapon.weaponId}:${weapon.level}`) ?? 0) > 1,
        stats: buildLoadoutWeaponStats(weapon.detailLines)
      })),
      items: player.loadout.items.map((item) => ({
        ...item,
        iconPath: resolveArenaSurvivorShopIconPath("item", item.itemId, state.visualTheme)
      }))
    },
    runSummary: choosingLevelBonus ? undefined : player.runSummary,
    playerStats: resolvePlayerStats(player, language),
    offers: enrichArenaSurvivorShopOffers(player.shop.offers, state.visualTheme),
    onBuy: (offerId) => {
      if (!player.playerId) {
        return;
      }

      context.onInput(createArenaSurvivorShopInput(player.playerId, offerId));
    },
    onSellWeapon: choosingLevelBonus ? undefined : (weaponInstanceId) => {
      if (!player.playerId) {
        return;
      }

      context.onInput(createArenaSurvivorShopSellInput(player.playerId, weaponInstanceId));
    },
    onCombineWeapon: choosingLevelBonus ? undefined : (weaponInstanceId) => {
      if (!player.playerId) {
        return;
      }

      context.onInput(createArenaSurvivorShopCombineInput(player.playerId, weaponInstanceId));
    }
  };
}

function buildArenaSurvivorJoystickModel(
  context: ControllerGameRenderContext,
  state: ArenaSurvivorState | null,
  player: ArenaSurvivorPlayerState | null
): VirtualJoystickLayoutModel {
  const playerId = context.state.player?.id ?? "";
  const language = context.state.room?.language;
  const lang = language ?? "de";
  const en = lang !== "de";
  const words = {
    de: { time: "Zeit", survived: "Überlebt", move: "Bewege dich frei. Automatische Schüsse laufen.", wait: "Warte auf die nächste Runde", helper: "Deine Waffe schießt automatisch. Gesammeltes Material erhält das ganze Team.", moveHelper: "Bewege deinen Charakter mit dem virtuellen Stick.", run: "LOS", life: "Leben", level: "Stufe", xp: "EP", material: "Material", timeLabel: "Zeit", intensity: "Intensität", wave: "Welle", cores: "Kerne" },
    en: { time: "Time", survived: "Survived", move: "Move freely. Auto-fire is active.", wait: "Waiting for the next round", helper: "Your weapon fires automatically. Collected material is shared with the whole team.", moveHelper: "Move your character with the virtual stick.", run: "MOVE", life: "HP", level: "Lvl.", xp: "XP", material: "Materials", timeLabel: "Time", intensity: "Intensity", wave: "Wave", cores: "Cores" },
    es: { time: "Tiempo", survived: "Sobreviviste", move: "Muévete libremente. El disparo automático está activo.", wait: "Esperando la siguiente ronda", helper: "Tu arma dispara automáticamente. El material recogido se comparte con el equipo.", moveHelper: "Mueve a tu personaje con el joystick virtual.", run: "MOVER", life: "Vida", level: "Niv.", xp: "XP", material: "Materiales", timeLabel: "Tiempo", intensity: "Intensidad", wave: "Oleada", cores: "Núcleos" },
    fr: { time: "Temps", survived: "Survie", move: "Déplace-toi librement. Le tir automatique est actif.", wait: "En attente de la prochaine manche", helper: "Ton arme tire automatiquement. Les matériaux récoltés sont partagés avec l’équipe.", moveHelper: "Déplace ton personnage avec le joystick virtuel.", run: "BOUGER", life: "PV", level: "Niv.", xp: "XP", material: "Matériaux", timeLabel: "Temps", intensity: "Intensité", wave: "Vague", cores: "Cœurs" },
    "pt-BR": { time: "Tempo", survived: "Sobreviveu", move: "Mova-se livremente. O disparo automático está ativo.", wait: "Aguardando a próxima rodada", helper: "Sua arma dispara automaticamente. O material coletado é compartilhado com a equipe.", moveHelper: "Mova seu personagem com o controle virtual.", run: "MOVER", life: "PV", level: "Nív.", xp: "XP", material: "Materiais", timeLabel: "Tempo", intensity: "Intensidade", wave: "Onda", cores: "Núcleos" }
  }[lang];
  const running =
    !state?.survival?.pause &&
    context.state.game?.phase === "playing" &&
    Boolean(player?.alive) &&
    state?.result.outcome === "running";
  const timeText =
    state?.result.outcome === "running"
      ? `${words.time} ${formatTime(state.remainingMs)}`
      : `${words.survived} ${formatTime(state?.elapsedMs ?? 0)}`;

  return {
    kind: "virtual_joystick",
    title: player?.name ?? "Arena Survivor",
    minimal: true,
    // Thumb zone: the stick sits at the lower screen edge while playing.
    stickPlacement: "lower-middle",
    subtitle: player?.respawnAtMs && state?.survival ? `Respawn ${Math.max(0, Math.ceil((player.respawnAtMs - state.elapsedMs) / 1000))}s` : running
        ? words.move
      : words.wait,
    helperText:
      state?.result.outcome === "running"
        ? words.helper
        : state?.result.title ?? words.moveHelper,
    disabled: !running,
    accentColor: player?.color ?? context.state.player?.color ?? "#38bdf8",
    resetKey: `${context.state.game?.roundNumber ?? 0}:${context.state.game?.phase ?? "idle"}`,
    centerLabel: words.run,
    stats: [
      { label: words.life, value: `${formatRoundedHp(player?.hp)}/${formatRoundedHp(player?.maxHp)}` },
      { label: words.level, value: `${player?.level ?? 1}` },
      { label: words.xp, value: `${Math.round(player?.experience ?? 0)}/${Math.round(player?.experienceToNextLevel ?? 1)}` },
      { label: words.material, value: `${player?.materials ?? 0}` },
      { label: "Status", value: formatStatus(player, state, lang), highlighted: true },
      { label: words.timeLabel, value: timeText },
      { label: state?.survival ? words.intensity : words.wave, value: `${state?.waveNumber ?? 1}` },
      ...(state?.survival ? [{ label: words.cores, value: `${player?.evolutionCores ?? 0}` }] : [])
    ],
    onMoveChange: (moveX, moveY) => {
      if (!playerId) {
        return;
      }

      context.onInput(createArenaSurvivorMoveInput(playerId, moveX, moveY));
    }
  };
}

export function buildArenaSurvivorControllerModel(
  context: ControllerGameRenderContext
): ArenaSurvivorModernShopLayoutModel | VirtualJoystickLayoutModel {
  const gameState = (context.state.game?.state ?? null) as ArenaSurvivorState | null;
  const currentPlayer = resolveCurrentPlayer(context, gameState);
  const controllerPhase = context.state.game?.phase;
  if (gameState?.survival && gameState.result.outcome !== "running" && currentPlayer) {
    const model = buildArenaSurvivorShopModel(context, gameState, currentPlayer);
    model.survival = { phase: "result", cores: currentPlayer.evolutionCores ?? 0, level: gameState.survival.level };
    model.title = gameState.result.title;
    model.helperText = context.state.room?.language === "en" ? "Start a new run or return to setup on the host." : "Starte am Host einen neuen Run oder kehre zum Setup zurueck.";
    model.offers = []; model.ready = undefined; model.reroll = undefined;
    model.onSellWeapon = undefined; model.onCombineWeapon = undefined; model.disabled = true;
    return model;
  }
  const shouldShowShop =
    Boolean(currentPlayer) && !gameState?.survival?.pause &&
    (Boolean(currentPlayer?.shop.available) ||
      controllerPhase === "result" ||
      controllerPhase === "scoreboard" ||
      controllerPhase === "finished" ||
      controllerPhase === "locked");

  if (gameState && currentPlayer && shouldShowShop) {
    return buildArenaSurvivorShopModel(context, gameState, currentPlayer);
  }

  if (gameState?.survival?.pause && currentPlayer) {
    return buildSurvivalPauseModel(context, gameState, currentPlayer);
  }

  return buildArenaSurvivorJoystickModel(context, gameState, currentPlayer);
}

function buildSurvivalPauseModel(context: ControllerGameRenderContext, state: ArenaSurvivorState, player: ArenaSurvivorPlayerState): ArenaSurvivorModernShopLayoutModel {
  const s = state.survival!;
  const language = context.state.room?.language ?? "de";
  const en = language !== "de";
  const words = {
    de: { victory: "Survival gewonnen!", forge: "Evolutionsschmiede", cores: "Eigene Kerne", waiting: "Warte auf das Team.", choose: "Wähle eines von drei Power-ups. Ohne Zeitlimit.", paused: "Der Kampf pausiert für alle. Bestätige, wenn du fertig bist.", continue: "Fortsetzen", chest: "Kistenfund", keep: "Behalten", keepCore: "Evolutionskern behalten", coreDesc: "Ein eigener Kern für die Schmiede.", salvage: "Verwerten", salvageDesc: "Erhalte Gold anstelle dieses Fundes.", teammate: "Ein Mitspieler entscheidet über seinen Kistenfund.", endless: "Endlos weiterspielen", finish: "Run abschließen", build: "Mit deinem Build weiterspielen.", victorySave: "Mit dem Sieg abschließen.", evolve: "1 eigener Kern · 2× Schaden, schnellere Angriffe, mehr Reichweite", setup: "Starte am Host einen neuen Run oder kehre zum Setup zurück." },
    en: { victory: "Survival won!", forge: "Evolution Forge", cores: "Personal cores", waiting: "Waiting for the team.", choose: "Choose one of three powers. No timer.", paused: "Combat is paused for everyone. Finish when ready.", continue: "Continue", chest: "Chest loot", keep: "Keep", keepCore: "Keep Evolution Core", coreDesc: "One personal core for the Forge.", salvage: "Salvage", salvageDesc: "Receive gold instead of this reward.", teammate: "A teammate is choosing their chest reward.", endless: "Continue Endless", finish: "Finish run", build: "Keep your build and keep fighting.", victorySave: "Save the victory.", evolve: "1 personal core · 2× damage, faster attacks, greater range", setup: "Start a new run or return to setup on the host." },
    es: { victory: "¡Supervivencia completada!", forge: "Forja de evolución", cores: "Núcleos personales", waiting: "Esperando al equipo.", choose: "Elige uno de tres poderes. Sin límite de tiempo.", paused: "El combate está pausado para todos. Confirma cuando estés listo.", continue: "Continuar", chest: "Botín del cofre", keep: "Conservar", keepCore: "Conservar núcleo de evolución", coreDesc: "Un núcleo personal para la Forja.", salvage: "Reciclar", salvageDesc: "Recibe oro en lugar de esta recompensa.", teammate: "Un compañero está eligiendo su botín.", endless: "Continuar sin fin", finish: "Terminar partida", build: "Sigue luchando con tu configuración.", victorySave: "Guardar la victoria.", evolve: "1 núcleo personal · doble daño, ataques más rápidos y más alcance", setup: "Inicia otra partida o vuelve a la configuración en la pantalla principal." },
    fr: { victory: "Survie réussie !", forge: "Forge d’évolution", cores: "Cœurs personnels", waiting: "En attente de l’équipe.", choose: "Choisis un pouvoir parmi trois. Sans limite de temps.", paused: "Le combat est en pause pour tout le monde. Confirme quand tu es prêt.", continue: "Continuer", chest: "Butin du coffre", keep: "Garder", keepCore: "Garder le cœur d’évolution", coreDesc: "Un cœur personnel pour la Forge.", salvage: "Récupérer", salvageDesc: "Reçois de l’or à la place de cette récompense.", teammate: "Un coéquipier choisit son butin.", endless: "Continuer sans fin", finish: "Terminer la partie", build: "Continue à combattre avec ton équipement.", victorySave: "Valider la victoire.", evolve: "1 cœur personnel · dégâts doublés, attaques plus rapides et portée accrue", setup: "Lance une nouvelle partie ou retourne à la configuration sur l’écran principal." },
    "pt-BR": { victory: "Sobrevivência concluída!", forge: "Forja da evolução", cores: "Núcleos pessoais", waiting: "Aguardando a equipe.", choose: "Escolha um entre três poderes. Sem limite de tempo.", paused: "O combate está pausado para todos. Confirme quando estiver pronto.", continue: "Continuar", chest: "Espólio do baú", keep: "Ficar", keepCore: "Ficar com o núcleo de evolução", coreDesc: "Um núcleo pessoal para a Forja.", salvage: "Reciclar", salvageDesc: "Receba ouro no lugar desta recompensa.", teammate: "Um colega está escolhendo o espólio.", endless: "Continuar sem fim", finish: "Encerrar partida", build: "Continue lutando com sua configuração.", victorySave: "Salvar a vitória.", evolve: "1 núcleo pessoal · dano dobrado, ataques mais rápidos e maior alcance", setup: "Inicie outra partida ou volte à configuração na tela principal." }
  }[language];
  const ready = s.readyPlayerIds.includes(player.playerId);
  const model = buildArenaSurvivorShopModel(context, state, player);
  model.survival = { phase: s.pause ?? "", cores: player.evolutionCores ?? 0, level: s.level };
  model.title = s.pause === "victory" ? words.victory : s.pause === "forge" ? words.forge : s.pause === "level_up" ? `Level ${s.level}` : "Survival Shop";
  model.subtitle = `${words.cores}: ${player.evolutionCores ?? 0}`;
  model.helperText = ready ? words.waiting : s.pause === "level_up" ? words.choose : words.paused;
  model.disabled = ready;
  if (s.pause === "level_up") {
    model.shopMode = "level_up";
    model.levelUpChoicesRemaining = ready ? 0 : 1;
    model.reroll = undefined;
    model.onSellWeapon = undefined;
    model.onCombineWeapon = undefined;
    model.loadout = undefined;
  }
  model.ready = s.pause === "shop" || s.pause === "forge" ? {
    currentPlayerReady: ready, readyCount: s.readyPlayerIds.length, playerCount: s.participantIds.length,
    language: context.state.room?.language, label: words.continue, description: model.helperText,
    onToggleReady: () => context.onInput({ type: "survival:ready", playerId: player.playerId, sentAt: Date.now() })
  } : undefined;
  if (s.pause === "chest") {
    const reward = s.chestReward;
    const ownsReward = reward?.playerId === player.playerId;
    model.title = words.chest;
    model.helperText = ownsReward
      ? (language === "de" ? "Fund behalten oder für Gold verwerten. Nach deiner Wahl geht es weiter." : `${words.keep} the reward or ${words.salvage.toLowerCase()} it for gold. Combat resumes after your choice.`)
      : words.teammate;
    model.shopMode = "level_up"; model.loadout = undefined; model.reroll = undefined;
    model.onSellWeapon = undefined; model.onCombineWeapon = undefined; model.disabled = !ownsReward;
    const loot = reward?.offer;
    model.offers = ownsReward && reward ? [
      { ...(loot ? enrichArenaSurvivorShopOffers([loot], state.visualTheme)[0] : {}), id: `${reward.id}:take`,
        kind: loot?.kind ?? "upgrade", title: loot ? `${words.keep}: ${loot.title}` : words.keepCore,
        description: loot?.description ?? words.coreDesc,
        iconPath: loot ? resolveArenaSurvivorShopIconPath("weapon", loot.weaponId!, state.visualTheme) : "/arena-survivor/themes/frostfire-saga/upgrades/core.png",
        targetLevel: loot?.targetLevel ?? 1, cost: 0, affordable: true, purchased: false },
      { id: `${reward.id}:salvage`, kind: "upgrade", title: `${words.salvage}: +${reward.salvageGold} gold`,
        description: words.salvageDesc, iconPath: "/arena-survivor/themes/frostfire-saga/pickups/material.png", targetLevel: 1, cost: 0, affordable: true, purchased: false }
    ] : [];
  }
  if (s.pause === "forge" || s.pause === "victory") {
    model.reroll = undefined; model.onSellWeapon = undefined; model.onCombineWeapon = undefined;
    model.shopMode = "level_up";
    model.offers = s.pause === "victory" ? [true, false].map(continueRun => ({
      id: continueRun ? "endless" : "finish", kind: "upgrade" as const, title: continueRun ? words.endless : words.finish,
      description: continueRun ? words.build : words.victorySave,
      targetLevel: 1, cost: 0, affordable: !ready, purchased: false
    })) : player.loadout.weapons.filter(w => w.level === 4 && !w.evolved).map(w => ({
      id: w.weaponInstanceId, kind: "weapon" as const, weaponId: w.weaponId, title: `✦ ${w.displayName}`,
      description: words.evolve,
      targetLevel: 4, cost: 0, affordable: (player.evolutionCores ?? 0) > 0, purchased: false,
      iconPath: resolveArenaSurvivorShopIconPath("weapon", w.weaponId, state.visualTheme)
    }));
    model.onBuy = id => context.onInput(s.pause === "victory" ? { type: "survival:endless", playerId: player.playerId, sentAt: Date.now(), continueRun: id === "endless" } : { type: "survival:evolve", playerId: player.playerId, sentAt: Date.now(), weaponInstanceId: id });
  }
  return model;
}

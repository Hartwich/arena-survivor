import { arenaSurvivorCharacterDefinitions } from "./server/content/characterDefinitions.js";
import { localizeArenaSurvivorCharacter } from "./contentText.js";
import type { LocalizedGameTextMap } from "@open-party-lab/game-core";
import type { SupportedLanguage } from "@open-party-lab/game-core";


const archetypes = {
  de: { ranged: "Fernkampf", melee: "Nahkampf", magic: "Magie", lifesteal: "Lebensraub", regen: "Regeneration", tank: "Panzer", speed: "Tempo", hybrid: "Allrounder", luck: "Glück", economy: "Wirtschaft" },
  en: { ranged: "Ranged", melee: "Melee", magic: "Magic", lifesteal: "Life steal", regen: "Regeneration", tank: "Tank", speed: "Speed", hybrid: "All-rounder", luck: "Luck", economy: "Economy" },
  es: { ranged: "A distancia", melee: "Cuerpo a cuerpo", magic: "Magia", lifesteal: "Robo de vida", regen: "Regeneración", tank: "Tanque", speed: "Velocidad", hybrid: "Versátil", luck: "Suerte", economy: "Economía" },
  fr: { ranged: "À distance", melee: "Corps à corps", magic: "Magie", lifesteal: "Vol de vie", regen: "Régénération", tank: "Tank", speed: "Vitesse", hybrid: "Polyvalent", luck: "Chance", economy: "Économie" },
  "pt-BR": { ranged: "À distância", melee: "Corpo a corpo", magic: "Magia", lifesteal: "Roubo de vida", regen: "Regeneração", tank: "Tanque", speed: "Velocidade", hybrid: "Versátil", luck: "Sorte", economy: "Economia" }
};
const translatedCharacters: Partial<Record<SupportedLanguage, Record<string, { title: string; description: string }>>> = {
  es: {
    "schrotto-scharfschuss": { title: "El tirador certero", description: "Le encanta lo que hace ruido desde lejos. Inflige mucho daño a distancia, pero es bastante frágil." },
    "kloppbert-keulenwucht": { title: "El golpe contundente", description: "Resuelve casi todo con un arma cuerpo a cuerpo. Mucho daño y más vida, pero ataca más despacio." },
    "funkenberta-flaemmchen": { title: "La llamita", description: "Lanza fuego, hielo y chispas. Mucho daño mágico y elemental, pero poca armadura." },
    "kanni-baldrian": { title: "El mordaz", description: "Parece inofensivo, pero atraviesa hordas. Mucho robo de vida y velocidad de ataque, aunque menos daño base." },
    "doktor-knolle": { title: "El sanador tardío", description: "Lleva vendas, té y una poción dudosa. Más regeneración y vida, pero menos velocidad." },
    "sir-pampel-panzer": { title: "El tanque", description: "Lleva más metal que sentido común. Mucha vida y armadura, a cambio de movilidad y velocidad de ataque." },
    flitzelotte: { title: "La bola turbo", description: "Ya se fue antes de que el enemigo note el ataque. Mucha velocidad y evasión, pero poca vida y alcance." },
    "professor-paradox": { title: "El todoterreno", description: "Tiene una teoría para todo y casi siempre una solución útil. Pequeñas ventajas en vida, daño, velocidad y economía." },
    "rundling-allround": { title: "El equilibrado", description: "Una opción equilibrada con pequeñas bonificaciones de vida, daño, velocidad y materiales a largo plazo." },
    "pruegler-brawler": { title: "El luchador cuerpo a cuerpo", description: "Ataca rápido y esquiva bien, pero tiene poco alcance y daño a distancia." },
    "jaeger-ranger": { title: "El luchador a distancia", description: "Gran alcance, daño a distancia y golpes críticos, pero menos vida y fuerza cuerpo a cuerpo." },
    "gluecksknolle-lucky": { title: "El afortunado", description: "Encuentra mejores objetos y curaciones, pero es más débil en combate directo." },
    "ackerling-farmer": { title: "El cosechador", description: "Destaca al recolectar y en economía a largo plazo, pero empieza con poco daño." }
  },
  fr: {
    "schrotto-scharfschuss": { title: "Le tireur d’élite", description: "Il adore faire du bruit à distance. D’importants dégâts à distance, mais une faible résistance." },
    "kloppbert-keulenwucht": { title: "La force de frappe", description: "Il résout presque tout avec une arme de mêlée. Dégâts élevés et plus de vie, mais une attaque plus lente." },
    "funkenberta-flaemmchen": { title: "La petite flamme", description: "Elle lance feu, glace et étincelles. Beaucoup de dégâts magiques et élémentaires, mais peu d’armure." },
    "kanni-baldrian": { title: "Le mordant", description: "Il semble inoffensif, mais traverse des hordes. Vol de vie et vitesse d’attaque élevés, dégâts de base réduits." },
    "doktor-knolle": { title: "Le guérisseur tardif", description: "Il a des pansements, du thé et une potion douteuse. Plus de régénération et de vie, mais moins de vitesse." },
    "sir-pampel-panzer": { title: "Le tank", description: "Il porte plus de métal que de bon sens. Beaucoup de vie et d’armure, au prix de la mobilité et de la vitesse d’attaque." },
    flitzelotte: { title: "La boulette turbo", description: "Elle a déjà disparu avant que l’ennemi ne remarque l’attaque. Rapide et agile, mais peu de vie et de portée." },
    "professor-paradox": { title: "Le polyvalent", description: "Il a une théorie sur tout et souvent une solution utile. Petits bonus en vie, dégâts, vitesse et économie." },
    "rundling-allround": { title: "L’équilibré", description: "Un choix équilibré avec de petits bonus en vie, dégâts, vitesse et matériaux à long terme." },
    "pruegler-brawler": { title: "Le combattant au corps à corps", description: "Rapide et agile au corps à corps, mais avec peu de portée et de dégâts à distance." },
    "jaeger-ranger": { title: "Le combattant à distance", description: "Grande portée, dégâts à distance et coups critiques, mais moins de vie et de force au corps à corps." },
    "gluecksknolle-lucky": { title: "Le chanceux", description: "De meilleurs butins et soins, mais moins efficace en combat direct." },
    "ackerling-farmer": { title: "Le récolteur", description: "Excellent en récolte et en économie à long terme, mais faible en dégâts au départ." }
  },
  "pt-BR": {
    "schrotto-scharfschuss": { title: "O atirador certeiro", description: "Adora o que faz barulho de longe. Causa muito dano à distância, mas é pouco resistente." },
    "kloppbert-keulenwucht": { title: "A força do porrete", description: "Resolve quase tudo com uma arma corpo a corpo. Muito dano e mais vida, mas ataca mais devagar." },
    "funkenberta-flaemmchen": { title: "A chaminha", description: "Lança fogo, gelo e faíscas. Muito dano mágico e elemental, mas pouca armadura." },
    "kanni-baldrian": { title: "O mordaz", description: "Parece inofensivo, mas atravessa hordas. Muito roubo de vida e velocidade de ataque, mas menos dano básico." },
    "doktor-knolle": { title: "O curandeiro tardio", description: "Carrega curativos, chá e uma poção duvidosa. Mais regeneração e vida, mas menos velocidade." },
    "sir-pampel-panzer": { title: "O tanque", description: "Carrega mais metal que bom senso. Muita vida e armadura, mas menos mobilidade e velocidade de ataque." },
    flitzelotte: { title: "O bolinho turbo", description: "Já sumiu antes que o inimigo perceba o ataque. Muita velocidade e esquiva, mas pouca vida e alcance." },
    "professor-paradox": { title: "O versátil", description: "Tem uma teoria para tudo e quase sempre uma solução útil. Pequenos bônus em vida, dano, velocidade e economia." },
    "rundling-allround": { title: "O equilibrado", description: "Uma opção equilibrada com pequenos bônus de vida, dano, velocidade e materiais a longo prazo." },
    "pruegler-brawler": { title: "O lutador corpo a corpo", description: "Ataca rápido e esquiva bem, mas tem pouco alcance e dano à distância." },
    "jaeger-ranger": { title: "O lutador à distância", description: "Grande alcance, dano à distância e críticos, mas menos vida e força corpo a corpo." },
    "gluecksknolle-lucky": { title: "O sortudo", description: "Encontra itens e curas melhores, mas é mais fraco no combate direto." },
    "ackerling-farmer": { title: "O colhedor", description: "É ótimo na coleta e na economia a longo prazo, mas começa com pouco dano." }
  }
};
function characterSetupText(language: SupportedLanguage) {
  return Object.fromEntries(arenaSurvivorCharacterDefinitions.map(character => {
    const fallbackLanguage = language === "de" ? "de" : "en";
    const text = localizeArenaSurvivorCharacter(character, fallbackLanguage);
    const translation = translatedCharacters[language]?.[character.id];
    return [character.id, { name: text.name, title: translation?.title ?? text.title, description: translation?.description ?? text.description, archetype: archetypes[language][character.archetype] }];
  }));
}

export const arenaSurvivorText = {
  "de": {
    "displayName": "Arena Survivor",
    "description": "Kaempft gemeinsam im Wave-Modus oder erkundet Frostfire im Survival-Modus mit Level-Ups, Loot und Waffen-Evolutionen.",
    "lobbySetup": {
      "title": "Run Setup",
      "description": "Lege die Schwierigkeit fest und gib den Run frei.",
      "fields": {
        "mode": {
          "label": "Modus / Mode",
          "description": "Wave: Wellen und Shops. Survival: 20 Minuten in der grossen Frostfire-Welt.",
          "options": {
            "wave": {
              "label": "Wave"
            },
            "survival": {
              "label": "Survival · Frostfire Saga"
            }
          }
        },
        "visualTheme": {
          "label": "Art Design",
          "description": "Waehle das komplette visuelle Set fuer Map, Figuren, Gegner und Ausruestung.",
          "options": {
            "marshmallow-mayhem": {
              "label": "Marshmallow Mayhem",
              "description": "Geröstete Aquarellwelt mit lebendigen Wide-Rigs, Blickanimation und süßen Monstern."
            },
            "frostfire-saga": {
              "label": "Frostfire Saga",
              "description": "Handgemalte nordische Storybook-Welt mit Eis, Glut, Runen und geschnitztem Holz."
            },
            "obsidian-relay": {
              "label": "Obsidian Relay",
              "description": "Detaillierte Sci-Fi-Ruinen, Plasma, Kupfer und schwarzes Metall."
            },
            "classic": {
              "label": "Classic Arena",
              "description": "Das bisherige warme, organische Arena-Design."
            }
          }
        },
        "difficulty": {
          "label": "Schwierigkeit",
          "description": "Gefahr 1 bis 5."
        }
      },
      "confirmation": {
        "label": "Run freigeben",
        "description": "Startet automatisch, sobald alle Spieler bereit sind."
      }
    },
    "visual": {
      "eyebrow": "Arena"
    },
    "playerSetup": {
      "title": "Charakterwahl",
      options: characterSetupText("de"),
      "description": "Wähle deinen Charakter für den Run."
    }
  },
  "en": {
    "displayName": "Arena Survivor",
    "description": "Fight together in Wave mode or explore Frostfire in Survival mode with shared level-ups, loot and weapon evolutions.",
    "lobbySetup": {
      "title": "Run setup",
      "description": "Choose the difficulty and unlock the run.",
      "fields": {
        "mode": {
          "label": "Mode",
          "description": "Wave: waves and shops. Survival: 20 minutes in the expansive Frostfire world.",
          "options": {
            "wave": {
              "label": "Wave"
            },
            "survival": {
              "label": "Survival · Frostfire Saga"
            }
          }
        },
        "visualTheme": {
          "label": "Art style",
          "description": "Choose the complete visual set for the map, characters, enemies and equipment.",
          "options": {
            "marshmallow-mayhem": {
              "label": "Marshmallow Mayhem",
              "description": "A toasted watercolour world with expressive figures, animated eyes and sweet monsters."
            },
            "frostfire-saga": {
              "label": "Frostfire Saga",
              "description": "A hand-painted Nordic storybook world of ice, embers, runes and carved wood."
            },
            "obsidian-relay": {
              "label": "Obsidian Relay",
              "description": "Detailed sci-fi ruins, plasma, copper and black metal."
            },
            "classic": {
              "label": "Classic",
              "description": "The original warm, organic arena style."
            }
          }
        },
        "difficulty": {
          "label": "Difficulty",
          "description": "Danger level from 1 to 5."
        }
      },
      "confirmation": {
        "label": "Unlock run",
        "description": "Starts automatically once every player is ready."
      }
    },
    "visual": {
      "eyebrow": "Arena"
    },
    "playerSetup": {
      "title": "Choose your character",
      options: characterSetupText("en"),
      "description": "Choose a character for this run."
    }
  },
  "es": {
    "displayName": "Arena Survivor",
    "description": "Lucha en equipo en el modo Oleadas o explora Frostfire en Supervivencia, con subidas de nivel, botín y evoluciones de armas.",
    "lobbySetup": { "title": "Configuración de partida", "description": "Elijan la dificultad y preparen la partida.", "fields": {
      "mode": { "label": "Modo", "description": "Oleadas: hordas y tiendas. Supervivencia: 20 minutos en el vasto mundo de Frostfire.", "options": { "wave": { "label": "Oleadas" }, "survival": { "label": "Supervivencia · Frostfire Saga" } } },
      "visualTheme": { "label": "Estilo visual", "description": "Elige el aspecto completo del mapa, personajes, enemigos y equipo.", "options": {
        "marshmallow-mayhem": { "label": "Marshmallow Mayhem", "description": "Un mundo de acuarela tostada con figuras expresivas y monstruos dulces." },
        "frostfire-saga": { "label": "Frostfire Saga", "description": "Un mundo nórdico pintado a mano, con hielo, brasas, runas y madera tallada." },
        "obsidian-relay": { "label": "Obsidian Relay", "description": "Ruinas de ciencia ficción con plasma, cobre y metal negro." },
        "classic": { "label": "Arena clásica", "description": "El estilo original de arena, cálido y orgánico." }
      } },
      "difficulty": { "label": "Dificultad", "description": "Peligro del 1 al 5." }
    }, "confirmation": { "label": "Preparar partida", "description": "Empieza automáticamente cuando todos estén listos." } },
    "visual": { "eyebrow": "Arena" },
    "playerSetup": { "title": "Elige personaje", options: characterSetupText("es"), "description": "Elige tu personaje para esta partida." }
  },
  "fr": {
    "displayName": "Arena Survivor",
    "description": "Combattez ensemble en mode Vagues ou explorez Frostfire en mode Survie, avec niveaux, butin et évolutions d’armes.",
    "lobbySetup": { "title": "Configuration de la partie", "description": "Choisissez la difficulté et préparez la partie.", "fields": {
      "mode": { "label": "Mode", "description": "Vagues : hordes et boutiques. Survie : 20 minutes dans le vaste monde de Frostfire.", "options": { "wave": { "label": "Vagues" }, "survival": { "label": "Survie · Frostfire Saga" } } },
      "visualTheme": { "label": "Style visuel", "description": "Choisissez l’apparence complète de la carte, des personnages, ennemis et équipements.", "options": {
        "marshmallow-mayhem": { "label": "Marshmallow Mayhem", "description": "Un monde aquarellé et grillé aux personnages expressifs et monstres gourmands." },
        "frostfire-saga": { "label": "Frostfire Saga", "description": "Un univers nordique peint à la main, entre glace, braises, runes et bois sculpté." },
        "obsidian-relay": { "label": "Obsidian Relay", "description": "Des ruines de science-fiction, du plasma, du cuivre et du métal noir." },
        "classic": { "label": "Arène classique", "description": "Le style d’arène d’origine, chaleureux et organique." }
      } },
      "difficulty": { "label": "Difficulté", "description": "Danger de 1 à 5." }
    }, "confirmation": { "label": "Préparer la partie", "description": "Démarre automatiquement quand tout le monde est prêt." } },
    "visual": { "eyebrow": "Arène" },
    "playerSetup": { "title": "Choisissez votre personnage", options: characterSetupText("fr"), "description": "Choisissez un personnage pour cette partie." }
  },
  "pt-BR": {
    "displayName": "Arena Survivor",
    "description": "Lute em equipe no modo Ondas ou explore Frostfire no modo Sobrevivência, com níveis, espólios e evoluções de armas.",
    "lobbySetup": { "title": "Configuração da partida", "description": "Escolham a dificuldade e preparem a partida.", "fields": {
      "mode": { "label": "Modo", "description": "Ondas: hordas e lojas. Sobrevivência: 20 minutos no vasto mundo de Frostfire.", "options": { "wave": { "label": "Ondas" }, "survival": { "label": "Sobrevivência · Frostfire Saga" } } },
      "visualTheme": { "label": "Estilo visual", "description": "Escolha a aparência completa do mapa, personagens, inimigos e equipamentos.", "options": {
        "marshmallow-mayhem": { "label": "Marshmallow Mayhem", "description": "Um mundo de aquarela tostada com figuras expressivas e monstros doces." },
        "frostfire-saga": { "label": "Frostfire Saga", "description": "Um mundo nórdico pintado à mão, com gelo, brasas, runas e madeira entalhada." },
        "obsidian-relay": { "label": "Obsidian Relay", "description": "Ruínas de ficção científica, plasma, cobre e metal negro." },
        "classic": { "label": "Arena clássica", "description": "O estilo original de arena, acolhedor e orgânico." }
      } },
      "difficulty": { "label": "Dificuldade", "description": "Perigo de 1 a 5." }
    }, "confirmation": { "label": "Preparar partida", "description": "Começa automaticamente quando todos estiverem prontos." } },
    "visual": { "eyebrow": "Arena" },
    "playerSetup": { "title": "Escolha seu personagem", options: characterSetupText("pt-BR"), "description": "Escolha um personagem para esta partida." }
  }
} as const satisfies LocalizedGameTextMap;

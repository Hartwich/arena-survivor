# Generated assets

## Frostfire Saga

The selectable `frostfire-saga` visual theme was created specifically for Arena Survivor with the built-in OpenAI Imagegen tool. The generated atlases were chroma-keyed with the Imagegen skill's local background-removal helper and then split into transparent 256 x 256 runtime PNGs.

The final theme contains:

- 13 character visuals
- 7 enemy-family visuals
- 21 weapon visuals
- 22 item icons
- one 1280 x 720 arena background

### Shared art direction

Polished hand-painted Nordic storybook game art with gouache texture, carved dark wood, forged steel, icy blue crystals, ember-orange runes, soft ivory snow, bold dark outlines, and non-pixelated silhouettes.

### Prompt set

1. Character atlas: a 4 x 4 atlas containing 13 ordered heroes and three empty cells on a flat green chroma-key background.
2. Enemy atlas: a 4 x 2 atlas containing seven ordered frostfire enemy families and one empty cell on a flat green chroma-key background.
3. Weapon atlas: a fully occupied 7 x 3 atlas containing the game's 21 ordered weapon concepts on a flat green chroma-key background. Every muzzle, blade tip, arrowhead, and striking end points straight upward so the runtime rotation consistently matches the attack direction.
4. Item atlas: a 6 x 4 atlas containing the game's 22 ordered passive-item concepts and two empty cells on a flat green chroma-key background.
5. Arena backgrounds: a strict top-down rectangular Nordic courtyard with a quiet, unobstructed combat area and sparse perimeter detail. The active warm-brown version improves foreground contrast; the cool ice-stone version and the original circular ritual-court version remain available as alternatives.

All prompts prohibited text, labels, logos, trademarks, and watermarks. The final runtime assets are stored under `public/host/arena-survivor/themes/frostfire-saga` and `public/controller/arena-survivor/themes/frostfire-saga`.

The active background is `backgrounds/frostfire-arena.png`. The retained alternatives are `backgrounds/frostfire-arena-ice.png` and `backgrounds/frostfire-arena-ritual.png`.

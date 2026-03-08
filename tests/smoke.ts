import { createBootstrapWorldState, buildWorldProjection } from "@ai-town/sim-core";
import { DEFAULT_CHARACTER_ID } from "@ai-town/shared-types";
import { selectFocusedCharacter } from "../apps/desktop/src/game/projection/worldProjectionSelectors";

const world = createBootstrapWorldState();
const proj = buildWorldProjection(world);
const focused = selectFocusedCharacter(proj);

if (!focused || focused.id !== DEFAULT_CHARACTER_ID) {
  console.error("Smoke FAIL: focus mismatch", { focused: focused?.id, expected: DEFAULT_CHARACTER_ID });
  process.exit(1);
}

console.log("Smoke PASS:", {
  focus: focused.id,
  label: focused.label,
  tick: proj.time.tick
});

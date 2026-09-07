#!/usr/bin/env node
/**
 * What VoiceOver actually says. The real thing, not a model of it.
 *
 * a11y-announce-audit.mjs approximates a screen reader from the accessibility
 * tree, which is fast, deterministic and CI-friendly — but it is a model, and a
 * model can be wrong in the same direction as the code it checks. This drives
 * real VoiceOver through the same journeys and writes down its actual speech,
 * so the model can be compared against the thing it claims to predict.
 *
 * It is deliberately a small number of journeys. Real-AT automation is slow and
 * flaky; the value is a periodic reality check, not a gate on every commit.
 *
 * ── One-time setup, which cannot be scripted ──────────────────────────────
 * macOS keeps these behind TCC precisely so that a script cannot grant itself
 * control of the screen reader. You have to do this by hand, once:
 *
 *   1. Enable AppleScript control of VoiceOver:
 *        VoiceOver Utility → General → "Allow VoiceOver to be controlled
 *        with AppleScript"
 *      (or: defaults write com.apple.VoiceOver4/default SCREnableAppleScript -bool true)
 *
 *   2. System Settings → Privacy & Security → Accessibility
 *        add and tick your terminal (and node, if prompted)
 *
 *   3. System Settings → Privacy & Security → Automation
 *        allow your terminal to control VoiceOver and System Events
 *
 * VoiceOver speaks aloud while this runs. Mute the output volume rather than
 * the system, or you lose the captured speech too.
 *
 *   node scripts/a11y-voiceover.mjs --base=http://localhost:3000
 */
import { voiceOver } from "@guidepup/guidepup";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = "true"] = a.replace(/^--/, "").split("=");
    return [k, v];
  }),
);
const BASE = args.base || "http://localhost:3000";
const ROUTE = args.route || "/";

/** Preflight: say plainly which prerequisite is missing rather than dying with
 *  an AppleScript error number that means nothing to the next reader. */
async function preflight() {
  if (process.platform !== "darwin") {
    return "not macOS — VoiceOver only exists here. Use the announce audit instead.";
  }
  try {
    if (!(await voiceOver.detect())) return "VoiceOver is not available on this machine.";
  } catch (err) {
    return `could not reach VoiceOver: ${err.message.split("\n")[0]}`;
  }
  return null;
}

const blocked = await preflight();
if (blocked) {
  console.error(`cannot run: ${blocked}`);
  console.error("Setup steps are in the header of this file.");
  process.exitCode = 2;
  process.exit();
}

const transcript = [];
/** Drain everything VoiceOver has said since the last drain. */
async function said(label) {
  const phrases = await voiceOver.spokenPhraseLog();
  const fresh = phrases.slice(transcript.spoken ?? 0);
  transcript.spoken = phrases.length;
  transcript.push({ label, phrases: fresh.filter(Boolean) });
  return fresh;
}

let failure = null;
try {
  await voiceOver.start();
  // Interact with the browser rather than the desktop.
  await voiceOver.navigateToApplication("Google Chrome").catch(() => {});

  await said("start");

  // Walk the top of the document: this is the first thing a listener meets, and
  // the order it arrives in is the thing no static tree check can confirm.
  for (let i = 0; i < 12; i += 1) {
    await voiceOver.next();
    await said(`next ${i + 1}`);
  }

  // Then the headings, which is how most listeners actually move through a page.
  await voiceOver.interact().catch(() => {});
  for (let i = 0; i < 8; i += 1) {
    await voiceOver.perform(voiceOver.keyboardCommands.findNextHeading).catch(() => {});
    await said(`heading ${i + 1}`);
  }
} catch (err) {
  failure = err.message.split("\n")[0];
} finally {
  await voiceOver.stop().catch(() => {});
}

const L = [];
L.push("# What VoiceOver actually said", "");
L.push(`Base: \`${BASE}${ROUTE}\` · captured ${new Date().toISOString().slice(0, 16).replace("T", " ")}`, "");
L.push("Real VoiceOver, driven by guidepup — not a model of one. Compare this");
L.push("against the same journeys in the announce audit: where they disagree, the");
L.push("model is wrong and needs correcting.", "");
if (failure) {
  L.push("> **This run did not complete.**", ">", `> \`${failure}\``, ">");
  L.push("> Most often this is the one-time permission setup in the header of");
  L.push("> `scripts/a11y-voiceover.mjs`. A partial transcript follows.", "");
}
L.push("| Step | VoiceOver said |", "|---|---|");
for (const t of transcript) {
  if (!t.phrases?.length) continue;
  L.push(`| ${t.label} | ${t.phrases.join(" · ").replace(/\|/g, "\\|")} |`);
}

await mkdir(path.join(ROOT, "docs", "a11y"), { recursive: true });
const file = path.join(ROOT, "docs", "a11y", `${new Date().toISOString().slice(0, 10)}-voiceover.md`);
await writeFile(file, L.join("\n"));

const spoken = transcript.reduce((n, t) => n + (t.phrases?.length ?? 0), 0);
console.log(`voiceover phrases captured: ${spoken}${failure ? ` · incomplete: ${failure}` : ""}`);
console.log(`report: ${path.relative(ROOT, file)}`);
// Capturing nothing means the run proved nothing, whatever the exit looked like.
process.exitCode = failure || spoken === 0 ? 1 : 0;

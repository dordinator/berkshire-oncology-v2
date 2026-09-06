# Screen reader test script — VoiceOver on macOS

Twenty minutes, at the keyboard, with the sound on. It is the part of the audit
that cannot be automated and cannot be delegated to a script: the question is not
whether the markup is correct but whether the site makes sense when you cannot
see it.

Record the result in `accessibility-audit-2026-09.md`, including **who ran it and
on what date**. A conformance claim that describes testing nobody did is worse
than one that admits the testing is outstanding.

---

## Before you start

Serve the site: `npm run build && npm start`, then open Safari. VoiceOver and
Safari are tested together; Chrome behaves differently and is not the pairing to
judge the site on.

**Turn VoiceOver on and off with `Cmd + F5`.** Turn it off the same way. If it is
reading too fast, `VO + Ctrl + Shift + →` speeds up and `←` slows it down.

`VO` means **Control + Option**, held together. The four things you need:

| Keys | What it does |
|---|---|
| `VO + →` / `VO + ←` | Move through the page, one thing at a time |
| `VO + Space` | Activate the thing you are on |
| `Tab` | Jump to the next link, button or field |
| `VO + U` | Open the rotor — then `←` `→` for Headings, Links, Landmarks |

The rotor is the one to get comfortable with. It is how most screen reader users
actually navigate: they list the headings and jump, rather than reading top to
bottom.

---

## The five tasks

Do each one as a task, not as an inspection. **Note where you hesitate**, not
only where something breaks — hesitation is the finding.

### 1. Arrive and orient — `/`

Turn on VoiceOver at the top of the home page and press `VO + →` about fifteen
times.

- Does the first thing you hear tell you where you are?
- Press `Tab` once from the top. You should hear a "Skip to content" link.
  Activate it. Does focus land in the main content?
- Open the rotor to Headings. Does the list read like an outline of the page, or
  like a jumble?

### 2. Find a consultant for a cancer type — `/specialities`

Without using the mouse, find a consultant who treats breast cancer.

- Use the search field at the top. As you type, are you told how many results
  there are?
- Can you get to a result with the arrow keys and open it?
- On the consultant's page, are their qualifications and the cancers they treat
  readable in a sensible order?

### 3. Understand a treatment — `/treatments/chemotherapy`

- Open the rotor to Headings and move through the page by heading alone. Does it
  tell a coherent story?
- Find the numbered pathway steps. Are they announced as headings you can jump
  between?
- Find a link to an outside source. **Are you told it opens in a new tab before
  you follow it?**

### 4. Find where you would be seen — `/locations`

This is the hardest page on the site and the one to concentrate on.

- Move down the page. **When the map moves to a new hospital, are you told which
  one?** You should hear the hospital name and "location 2 of 6".
- Can you reach the hospital addresses and their links?
- Press the down arrow. Does the page scroll normally, a line at a time?
- At a narrow window — drag Safari to about a third of the screen — can you reach
  the end of the introduction? It sits in a panel that scrolls inside itself.

### 5. Contact the practice — `/contact`

- Choose an option and follow it through.
- When new content appears after you choose, are you moved to it, or left behind?
- Is the phone number announced as something you can call?

---

## Also worth five minutes

**The mobile menu.** Narrow the window until the hamburger appears. Open it.

- Are you told a menu has opened?
- Can you `Tab` out of it into the page behind? **You should not be able to.**
- Does `Escape` close it and put you back on the button that opened it?

**Reduce motion.** System Settings → Accessibility → Display → Reduce motion.
Turn it on *while a page is open* and scroll. The page should stop its smooth
scrolling immediately, without a reload.

---

## What to write down

For anything that went wrong or made you pause:

1. The page and what you were trying to do.
2. What VoiceOver said, as close to word for word as you can manage.
3. What you expected instead.

"It said 'button' and I did not know what it would do" is a perfectly good
finding. So is "I could not tell whether anything had happened."

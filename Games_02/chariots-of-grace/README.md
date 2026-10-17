# Chariots of Grace — A Journey Through the Ten Commandments

A free, browser-based Bible-stories game that teaches morals through decision-making. Players ride a chariot through 12 stops — one Bible story for each of the Ten Commandments, plus a story of forgiveness (Joseph) and a story of giving (the widow's two coins) — and at each stop face a modern life choice that tests the same principle.

## How to run

Double-click `index.html`, or run `py -m http.server 8768 --directory chariots-of-grace` from `Games_02` and open `http://localhost:8768`. Plain `<script>` tags, no build step.

## Mechanics

| Element | What it does |
|---|---|
| ⚖️ Life choices | Each stop has 3 choices: faithful, half-hearted, or wrong. Order is shuffled. |
| 👑 Crowns | Earned for every faithful choice (and by a "Double Portion" of grace). Cast before the throne at the end. |
| ❤️ Virtue / ✝️ Faith | 0–100 meters. Faith ≥ 70 adds +1 to every grace roll. |
| 🪙 Talents | In-game coins. Spend on chariot upgrades or give at the temple. |
| 🪨 Burdens | Added by wrong choices. Lifted by repenting (prodigal son), by forgiving someone else, or laid down at the throne. |
| 🕊️ Forgiveness | Repenting **always** works — it is never left to chance. |
| 🎲 Moments of Grace | After each stop, cast the lot (d6): trial, quiet road, manna, ravens, angel, double portion, or (faith bonus) a glimpse of the chariot of fire. |
| 👼 Angels | Spend one to reveal the wise choice, or one automatically guards you during a trial. |
| 🛞 Chariots | Shepherd's Cart → Bronze → Golden → Chariot of Fire. Each tier adds bonus talents on faithful choices. |
| 🪑 Thrones | Finale: Elijah's chariot of fire ascends to the throne room of Revelation 4, with the 24 elders on their thrones. |
| 💛 Donations | Donate tab and end screen link to Ko-fi (same account as Rootwords). Donating never affects gameplay. |

## Files

- `js/stories.js` — commandments, journey stops, grace outcomes, chariot tiers (edit here to add stories)
- `js/art.js` — inline SVG chariots, angels, throne, crowns, dice
- `js/game.js` — game state, screens, save/resume (localStorage, optional)
- `css/style.css` — styles

Story summaries are original paraphrases; short verse quotes are KJV (public domain).

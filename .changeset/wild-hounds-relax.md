---
"@farmsapp/design-system": minor
---

Add OTPInput — a one-time-code field with one box per character, backed by a single gapless string (deleting closes up the boxes after it, same as a text field). Only one box is a Tab stop, arrow keys/Home/End move between boxes, a paste or SMS autofill splits across boxes from wherever it lands, and `isMasked` shows each entered character as a bullet. Each box is flat and filled until it holds the caret, when it switches to a bordered, focused look.

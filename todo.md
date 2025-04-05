# 🚽 Toilet Spotter - Development To-Do List

## 🧱 Phase 1: Setup & Infrastructure

- [ ] Choose and initialize cross-platform framework (Flutter **or** React Native w/ Expo)
- [ ] Set up project repo with Git version control
- [ ] Configure development environments for:
  - [ ] iOS
  - [ ] Android
  - [ ] Web
- [ ] Set up backend environment (Firebase, Supabase, or custom API)
- [ ] Set up database schema for:
  - [ ] Bathroom codes
  - [ ] Votes
  - [ ] Device identifiers

---

## 📍 Phase 2: Location + Code Submission

- [ ] Get user's current location (GPS permissions)
- [ ] Build UI for submitting a new code
- [ ] Store submitted code with:
  - [ ] Geolocation
  - [ ] Optional description
  - [ ] Timestamp
- [ ] Check for duplicates (same code in same ~50m radius)
- [ ] Block duplicate submissions

---

## 🗺️ Phase 3: Map & Code Discovery

- [ ] Display nearby bathroom codes based on location
- [ ] Create list view and map view of nearby codes
- [ ] Show code data:
  - [ ] Code string
  - [ ] Optional description
  - [ ] Time since posted
  - [ ] Vote count
  - [ ] Distance

---

## 👍 Phase 4: Voting & Validation

- [ ] Implement upvote/downvote UI
- [ ] Restrict voting per device per code
- [ ] Store and update vote totals
- [ ] Block self-voting (on same device)

---

## 🧹 Phase 5: Auto-Cleanup of Bad Codes

- [ ] Schedule cleanup job or function to:
  - [ ] Check each code's vote score + age
  - [ ] Remove codes with score < -3 and older than 72 hours

---

## 🔒 Phase 6: Privacy & Anonymity

- [ ] Ensure no account system is in place
- [ ] Do not store any personal or business-identifying info
- [ ] Use anonymized device ID for voting control

---

## 🎯 Phase 7: Polish & Platform Support

- [ ] Test and optimize app on:
  - [ ] iOS
  - [ ] Android
  - [ ] Web
- [ ] Responsive design for all devices
- [ ] Clean and intuitive UI/UX
- [ ] Minimalist style (dark/light mode optional)

---

## 🌱 Phase 8: Stretch Goals & Future Features

- [ ] Add sorting options (e.g., most upvoted, closest)
- [ ] Offline caching of last-seen codes
- [ ] Anonymous commenting per code (no business names)
- [ ] Reporting/flagging system

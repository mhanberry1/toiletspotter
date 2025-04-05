# Product Requirements Document (PRD)

**Product Name:** Toilet Spotter  
**Author:** [Your Name]  
**Date:** April 5, 2025  
**Version:** 1.1  

---

## 1. Overview

**Toilet Spotter** is a mobile/web application that helps users find and share access codes to locked public restrooms. The app allows users to anonymously post bathroom door codes pinned to their current location. Other users can upvote or downvote these codes, helping ensure only the most accurate and helpful codes remain. The app will not require user accounts, will not track businesses or store business-specific data, and all posts will be anonymous.

---

## 2. Goals

- Help users quickly discover working bathroom codes near them.
- Allow anonymous code contributions and voting with no sign-up.
- Use a single codebase that supports iOS, Android, and Web.
- Avoid storing or referencing business-specific information (e.g., brand names, addresses).

---

## 3. Features

### 3.1 Core Features

#### 3.1.1 Add Bathroom Code

- Users can anonymously submit a bathroom door code.
- Code is pinned to the user's current location (via GPS).
- Users can optionally include a description (e.g., "inside back hallway").
- No mention of business names is stored or displayed.
- Duplicate prevention: Same code within the same location cluster (e.g., 50-meter radius) is not allowed.

#### 3.1.2 View Nearby Codes

- Users can view nearby bathroom codes on a map or list.
- Each listing shows:
  - The code itself
  - Optional user-added description
  - Distance from current location
  - Net vote score
  - Time since posting

#### 3.1.3 Voting System

- Users can upvote or downvote any posted code.
- Votes are limited per code per device (e.g., via local storage or anonymous identifier).
- Vote counts are visible to help users assess reliability.

#### 3.1.4 Auto Removal of Bad Codes

- Any code with a negative net score (e.g., < -3) **and** older than a configured threshold (e.g., 72 hours) will be automatically deleted.
- Ensures poor or outdated codes don't linger.

---

## 4. Non-Functional Requirements

### 4.1 Anonymity & Privacy

- No user accounts or logins.
- No personal data or business identifiers.
- No business names stored or used in any way.
- Votes are tracked anonymously per device to prevent spam.

### 4.2 Platform Strategy

- The app must run on:
  - iOS
  - Android
  - Web browsers
- A **single codebase** will be used to build and maintain the app across platforms.
- **Framework Recommendation:** Flutter or React Native with Expo + Web support

---

## 5. Edge Cases & Rules

- Duplicate codes (same code, same area) will be blocked from submission.
- Reposted codes after deletion are allowed but treated as new entries.
- Self-voting is blocked (e.g., a device cannot upvote its own submitted code).
- No geotagged business metadata should be collected.

---

## 6. Tech Stack Recommendations

| Component         | Recommended Tech                          |
|------------------|--------------------------------------------|
| Frontend         | Flutter **or** React Native with Expo      |
| Backend API      | Firebase, Supabase, or lightweight Express |
| Database         | Firestore, Supabase, or PostgreSQL         |
| Hosting          | Firebase Hosting, Vercel, or Netlify       |
| Map/Location API | Mapbox, Google Maps, or OpenStreetMap      |

---

## 7. Success Metrics

- Daily/weekly new code submissions
- Average net vote score per code
- Code survival rate (i.e., % of codes not auto-deleted)
- App usage (unique sessions per platform)

---

## 8. Future Considerations

- Add filtering/sorting (e.g., most upvoted, closest, newest)
- Add light/dark mode or minimalist UI options
- Allow short anonymous comments per code (no business refs)
- Temporary offline access to recently viewed codes

# ⚡ The Procrastination Assistant

> A privacy-first, client-side biometric companion that monitors screen freeze, posture rigidity, and distraction spirals—with built-in physical break interventions and emergency fall protection.

---

## 🎯 Overview

**The Procrastination Assistant** is designed to tackle the modern "screen freeze" phenomenon—the physical and mental trance where individuals remain completely still at their desks avoiding an important task, grinding through a marathon gaming session, or falling down an endless doomscroll spiral.

Operating **100% in the user's browser via local machine-learning models**, it tracks facial landmarks and micro-movement in real time. **Zero video or biometric data ever leaves the device.**

---

## ✨ Key Features

### 1. 🔒 Local Mesh & Privacy-First Telemetry
- **On-Device Face Mesh**: Utilizes Google MediaPipe Face Landmarker running in real time on the CPU.
- **Airgapped Assurance**: An overlay indicator (`LOCAL MESH • ZERO DATA SENT`) affirms that no image or telemetry data is dispatched over any network.
- **Picture-in-Picture HUD**: A sleek ~180px mirrored webcam HUD positioned in the bottom-right corner displays real-time frame differential motion (`ΔMotion: 0.00`) and highlights **Landmark #1 (Nose Tip)** with an interactive targeting reticle.

---

### 2. 🪑 Biometric Freeze & Immobility Detection
- **Landmark #1 Nose Tracking**: Infers user coordinates throttled to **200ms** to minimize CPU consumption.
- **Euclidean Displacement ($\Delta\text{Pos}$)**: Calculates distance between consecutive nose coordinates:
  $$\Delta\text{Pos} = \sqrt{(x_t - x_{t-1})^2 + (y_t - y_{t-1})^2}$$
- **Status Classification**:
  - $\Delta\text{Pos} < 0.015 \implies$ **`STATIC`** (Catatonic screen trance)
  - $\Delta\text{Pos} \ge 0.015 \implies$ **`ACTIVE`** (Movement / active fidgeting)

---

### 3. ⏱️ Dual Biometric Timers
- **👀 Gaze Time (Target: 30m)**: Increments continuously while the user's eye and face orientation points toward the monitor.
- **🪑 Immobility Time (Target: 20m)**: Increments whenever the user is marked `STATIC` without physical movement.
- **Dynamic Progress Bars**: Dual visual progress tracks show elapsed time, completion percentages, and warning states.

---

### 4. 🧘 Physical Reset Intervention Protocol
When **Gaze Time $\ge$ 30m** OR **Immobility Time $\ge$ 20m** (or via demo fast-forward):
- **Glassmorphic Intervention Modal**: An emergency card (`indigo-950` backdrop blur) interrupts the freeze:
  - *"⚠️ Physical Reset Required — You've been locked at your screen without moving for 30 minutes. Break the avoidance freeze."*
- **3 Physical Action Buttons**:
  - 💧 **Refill Water**: Hydrate and step away.
  - 🚪 **Doorway Stretch**: Release thoracic posture compression.
  - 🪟 **Horizon Scan**: Exercise the 20-20-20 eye strain rule.
- **60-Second Breathing Circle**: Guides the user through a rhythmic 12-second cycle (*Inhale 4s • Hold 4s • Exhale 4s*).
- **"User Away" Auto-Detection**: If the camera detects that the user stood up and stepped out of frame for $>5$ seconds, the reset auto-completes.
- **Return Welcome**: Once the user returns to their desk, a gentle momentum toast appears offering a **2-Minute Micro-Start Sprint** to break the blank-page freeze.

---

### 5. 🚨 Sudden Drop & Fall Emergency Protocol
- **Rapid Drop Detection**: Continuously monitors the vertical coordinate ($Y$) of the nose tip. If a sudden downward drop occurs within **1–2 seconds** (simulating a faint, collapse, or chair slip), the app initiates an emergency protocol.
- **1-Minute Safety Countdown**:
  - Sounds an audible warning alarm synthesized via Web Audio API.
  - Prompts the user: *"Are you okay? We detected a sudden downward drop. If you do not get up or click OK within 1 minute, an emergency call will be placed to your family members."*
  - Includes a large, high-visibility **"I AM OK — CANCEL EMERGENCY"** button.
- **Automated Family Emergency Call**:
  - If 60 seconds expire without an upright posture recovery or an "OK" click, the system triggers the emergency dispatch screen.
  - Simulates an automated telephone dialer with US ringback tone, incident GPS coordinates, and provides a direct `tel:` device dispatch link.
  - Supports configurable family contact names and telephone numbers.

---

### 6. 🎮 Multiple Activity Modes
Users can toggle between three contexts with a single click:
1. 💼 **Work**: Monitors avoided deliverables (e.g., *"Writing Q3 Strategy RFC"*), corporate burn-rate guilt quotient, and generates professional plausible-deniability excuses.
2. 🎮 **Game**: Monitors posture freeze during gaming sessions (e.g., *"Ranked Match Grind"*), prevents dry-eye strain, and provides squad pause messages.
3. 🍿 **Time Pass**: Catches mindless scrolling (e.g., *"Doomscrolling Shorts & Social Feeds"*) and suggests habit interrupters.

---

## ⌨️ Demo & Pitch Shortcuts

For live presentations and hackathon pitches, quick-demo shortcuts are enabled:

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`D`** | **Fast-Forward Demo** | Jumps Gaze to `29:55` and Immobility to `19:55` so the 30m break triggers live in **5 seconds**. |
| **`F`** | **Test Fall Alert** | Immediately simulates a 1–2s sudden downward collapse and starts the 1-minute family call countdown. |
| **`R`** | **Reset All** | Instantly resets all timers, modals, and telemetry back to `00:00`. |

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript (Vite bundler)
- **Styling**: Tailwind CSS v4 (Dark mode, `slate-950` foundation, sleek `slate-800` borders)
- **Computer Vision**: `@mediapipe/tasks-vision` (FaceLandmarker CPU model)
- **Audio Synthesis**: Native Web Audio API (Oscillator-based alarms, telephone ringback, UI blips—zero external audio assets)
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/the-procrastination-assistant.git

# Navigate to directory
cd the-procrastination-assistant

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Scripts

- `npm run dev`: Runs Vite dev server on port 3000
- `npm run build`: Compiles production distribution bundle
- `npm run lint`: Verifies TypeScript types with `tsc --noEmit`

---

## 🛡️ Privacy & Permissions

- **Camera Permission**: The app requests standard video stream access through `navigator.mediaDevices.getUserMedia`.
- **Zero Server Uploads**: Every frame is processed within client memory and garbage-collected immediately. No images, videos, audio, or biometric coordinates are ever stored or transmitted to external servers.

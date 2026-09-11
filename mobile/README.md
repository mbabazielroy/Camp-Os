# Mill Stream - phone app shell

A small Expo app that displays the Mill Stream web app, so you can use it on a phone and
later ship it to the App Store / Play Store. It does not contain app logic - all the
features live in the Next.js project in the folder above.

## Quickest way to see the app on a phone (no Expo)

From the **project root**, in two terminals:

```bash
npm run dev:lan   # terminal 1 - serves the web app on your network
npm run phone     # terminal 2 - prints a QR code
```

Scan that QR with your phone's **camera app**. That's it - it opens in the phone browser.
Choose "Add to Home Screen" and it behaves like an installed app.

## Running the Expo shell

```bash
npm run dev:lan        # terminal 1, in the project root

cd mobile              # terminal 2
npm install
npx expo start
```

Install **Expo Go** on the phone and scan the QR code from terminal 2.

You do **not** need to set an IP address anywhere. The app works out where the web server
is from the address Expo itself served the bundle from. If the guess is wrong, the app
shows a screen where you can type the address on the phone and it remembers it.

To pin a specific address instead (for example a deployed site), create `mobile/.env`:

```
EXPO_PUBLIC_APP_URL=https://your-deployed-app.example.com
```

`EXPO_PUBLIC_*` values are baked in when the bundle is built, so restart with
`npx expo start --clear` after changing them. An address typed on the phone overrides it.

## Running in GitHub Codespaces (or Gitpod)

There is no LAN between your phone and a cloud dev environment, so the rules are
different: each port is published as its own public HTTPS address.

**Easiest path - no Expo at all:**

1. `npm run dev:lan` in the project root.
2. In the **PORTS** tab (next to TERMINAL), right-click port **3000** → *Port Visibility* →
   **Public**. While it is private, your phone only gets a GitHub login page.
3. `npm run phone` - it detects Codespaces and prints the public `https://…-3000.app.github.dev`
   address plus a QR code. Scan it with the phone camera.

**With Expo Go:** the address is worked out for you (`app.config.ts` builds it from the
Codespace name), but Expo Go still has to download the bundle, and Metro's own port isn't
reachable the normal way. Start it as a tunnel:

```bash
npm run start:tunnel
```

Make port 3000 public as above, then scan the tunnel QR with Expo Go.

## Troubleshooting

### `Failed to load resource: 500` and "MIME type ('application/json') is not executable"

Two things are happening, and neither is the camp app itself:

- **The 500** is Metro failing to build the bundle. The real error is printed in the
  terminal running `expo start` - read that line. The most common cause after pulling new
  code is missing packages: run `npm install` in `mobile/`, then `npx expo start --clear`.
- **The MIME warning** means a *browser* was pointed at Metro (port 8081). That port serves
  a JavaScript bundle to Expo Go, not a web page - opening it in a browser can't work.
  Open port **3000** in a browser (that's the web app), and give port 8081 to Expo Go only.

### The app opens but shows "Couldn't reach ..."

The shell reached your phone fine; it's the **web server** that's unreachable.

1. Is `npm run dev:lan` running in the **project root** (not in `mobile/`)? Plain
   `npm run dev` only listens on the computer itself, so a phone can't see it.
2. Are both devices on the **same Wi-Fi**? Guest networks and "client isolation" on some
   routers block phone-to-computer traffic. Phone on mobile data will never work.
3. **Windows Firewall** blocks port 3000 by default. Once, in an *administrator* Command
   Prompt:
   ```
   netsh advfirewall firewall add rule name="Next dev 3000" dir=in action=allow protocol=TCP localport=3000
   ```
4. Open the same address in the phone's browser. If that fails too, it's the network -
   nothing in this app can fix it, so work through 1-3.

### Scanning the QR gives an error before the app even loads

That's Expo Go failing to reach **Metro** (port 8081), which is a different problem from
the above.

- **"Project is incompatible with this version of Expo Go"** - update Expo Go from the App
  Store / Play Store. Expo Go only runs the current SDK (this project uses SDK 57).
- **"Could not load exp://..." / network request failed** - Metro isn't reachable on the
  LAN. Either allow port 8081 through the firewall (same `netsh` command with `8081`), or
  skip the LAN entirely:
  ```
  npm run start:tunnel
  ```
  That routes through Expo's servers and works across networks. Note the tunnel only
  carries the app bundle - the web app still needs to be reachable, so with a tunnel you
  should point `EXPO_PUBLIC_APP_URL` at a deployed URL rather than a LAN address.
- **iOS camera won't open the code** - open Expo Go itself and use "Scan QR code" there.

### `UNKNOWN: unknown error` while starting Metro on Windows

Windows couldn't read a file in `node_modules`. In order:

1. Clean reinstall:
   ```
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   npx expo start --clear
   ```
2. Add the project folder to Windows Defender exclusions (Virus & threat protection →
   Manage settings → Exclusions).
3. If the project is on an **external drive or one formatted exFAT/FAT32**, move it to the
   internal drive. Metro is not reliable on those filesystems:
   ```
   robocopy E:\path\to\Camp-Os C:\dev\Camp-Os /e /xd node_modules .next
   ```

## Scripts

| Command | What it does |
| --- | --- |
| `npx expo start` | Normal start; scan with Expo Go |
| `npm run start:clear` | Start with a cleared Metro cache (use after editing `.env`) |
| `npm run start:tunnel` | Start via Expo's tunnel when the LAN doesn't work |

## Shipping a real app later

This project is already set up for `eas build`, which produces installable iOS/Android
apps (no Expo Go needed). Native-only features - push notifications for urgent emails,
for example - would be added here.

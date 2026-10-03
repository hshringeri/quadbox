# quadbox

Watch up to **4 sports games at once** on one screen — each video full-bleed
in its quadrant, like a personal RedZone quad box. macOS + Chrome.

Native fullscreen can't cover a quarter of a display (the Fullscreen API is
all-or-nothing), and streaming sites can't be embedded in a custom app
(`X-Frame-Options` + Widevine DRM). quadbox works around both: it tiles real
Chrome windows into a 2×2 grid and stretches each video player to fill its
window.

## Quickstart — 4 games in 60 seconds

```sh
git clone https://github.com/hshringeri/quadbox.git
cd quadbox
./quadbox
```

Paste up to 4 game links, one per line, hit Enter — done. Or pass them
directly:

```sh
./quadbox <url1> <url2> <url3> <url4>
```

Then click play in each window once, and mute the three you're not listening
to (player volume buttons).

What you get depends on the source — quadbox picks the best engine
automatically:

| Source | What happens | Setup |
|---|---|---|
| YouTube (all 4 links) | One window, built-in 2×2 embed grid, auto-playing muted | none |
| Aggregator watch pages (buffstreams/streameast-style) | Each page's player is resolved to its direct URL, which fills its window natively | none |
| NFL+, ESPN, Prime, Peacock, … | Tiled app-mode windows; video pinned full-bleed | one-time, below |

## Buffstreams picker (no link-hunting)

```sh
./quadbox nhl                # numbered menu of today's NHL games — pick up to 4
./quadbox nhl sabres         # auto-launch every game matching keywords
./quadbox nfl chiefs eagles  # multiple words narrow the match
```

### Example: 4 games, zero link-hunting

```console
$ ./quadbox nhl
1   Buffalo Sabres vs Chicago Blackhawks
2   Columbus Blue Jackets vs Utah Mammoth
3   Edmonton Oilers vs Seattle Kraken
4   Philadelphia Flyers vs Carolina Hurricanes
5   Pittsburgh Penguins vs Montréal Canadiens
6   Tampa Bay Lightning vs Washington Capitals
7   Toronto Maple Leafs vs Ottawa Senators
8   New York Islanders vs New Jersey Devils
9   Minnesota Wild vs Boston Bruins
10  Nashville Predators vs Dallas Stars
11  Colorado Avalanche vs St. Louis Blues
12  San Jose Sharks vs Los Angeles Kings
13  Vancouver Canucks vs Calgary Flames
pick up to 4 numbers (space separated): 1 3 7 9
launching: Buffalo Sabres vs Chicago Blackhawks
launching: Edmonton Oilers vs Seattle Kraken
launching: Toronto Maple Leafs vs Ottawa Senators
launching: Minnesota Wild vs Boston Bruins
win1: -> x=0   y=38  735x472  pin=native
win2: -> x=735 y=38  736x472  pin=native
win3: -> x=0   y=510 735x472  pin=native
win4: -> x=735 y=510 736x472  pin=native
```

Four windows, 2×2, each with its full-bleed player. Click play once per
window, mute three.

Only know team names? Skip the menu — keywords match the listing and launch
directly (great for a single game: `./quadbox nhl sabres`). One sport per
run; for a mixed-sport quad, paste the four links instead.

Sport keys are whatever the site lists that day (`nhl`, `nfl`, `cfb`,
`mlb-playoffs`, `nba-preseason`, `cfl`, …). Pre-game you get the watch page
(it goes live there); once live, the command resolves straight to the
full-bleed player. If the site rotates domains:
`BUFF_DOMAIN=https://<new-domain> ./quadbox nhl`

## One-time setup for full-bleed on any site

Only needed for services whose player sits inside a rich page (NFL+, ESPN,
Prime, …). Pick one:

**A. quadfill extension (recommended):**
1. Chrome → `chrome://extensions`
2. Developer mode (top right) → ON
3. "Load unpacked" → select the `extension/` folder from this repo

**B. Apple Events:** Chrome menu bar → View ▸ Developer ▸ Allow JavaScript
from Apple Events. (`./quadbox pin` re-applies the pin to small windows.)

Both are no-ops during normal browsing: the pin only activates in windows
narrower than 60% of your screen.

## How it works

- **Tiling:** `NSScreen.visibleFrame` via JXA → exact work area; AppleScript
  sizes real Chrome `--app=` windows (no tab/URL bars) into quadrants.
  Windows you already had open are never touched.
- **YouTube:** links are rewritten to `/embed/` players inside a local page
  (`web/quad.html`, served by a localhost-only `python3 -m http.server` on
  port 8787, auto-started; stop with `kill $(lsof -ti:8787)`). Direct embed
  navigation is refused by YouTube (error 153); iframing from a real page
  with a referer is not.
- **Aggregators:** the watch page is fetched with curl, the player iframe URL
  extracted (`embed|player|stream` heuristics, ad networks excluded), and
  opened directly — those players self-fill. Placeholder embeds (stream not
  live yet) fall back to the watch page.
- **Pin (`quadfill.js` / `extension/content.js`):** finds the largest
  `<video>`, climbs to its player wrapper (site controls keep working), pins
  it `position: fixed; 100vw×100vh`. Handles iframe-nested players too. Retries
  every 2 s to survive slow loads and SPA rebuilds. `object-fit: contain` by
  default — change to `cover` in either file to fill with slight side-crop.

## Caveats

- **Audio:** every video plays sound. Mute all but one.
- **Concurrent-stream limits** of your subscriptions cap how many paid
  streams actually run at once.
- **Aggregator sites:** expect popup/redirect ads — never click "Allow
  notifications"; close popups. Streams typically lag live TV by 30–60 s.
- YouTube TV subscribers: built-in **multiview** is the zero-effort quad box
  when your games are in a multiview group.

## Disclaimer

quadbox is a window-management tool for your personal viewing. Respect the
terms of service of your streaming providers and the rights of content
owners. No streams are hosted, proxied, or decrypted by this project.

## Files

```
quadbox               # the CLI (bash + AppleScript/JXA)
web/quad.html         # YouTube 2x2 grid page (localhost)
quadfill.js           # pin script injected via Apple Events
extension/            # quadfill as a Chrome extension (site-agnostic)
```

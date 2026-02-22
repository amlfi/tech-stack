#!/bin/bash
# Extract macOS app icons for tool cards
# Uses sips to convert .icns from app bundles to 128px PNGs

ICONS_DIR="$(dirname "$0")/../src/images/tools"
TOOLS_DIR="$(dirname "$0")/../content/tools"

mkdir -p "$ICONS_DIR"

# Map tool slugs to macOS app names
# Format: slug|App Name (as it appears in /Applications)
declare -a MAPPINGS=(
  "1password|1Password"
  "1password-for-safari|1Password for Safari"
  "a-better-finder-rename-12|A Better Finder Rename 12"
  "agenda|Agenda"
  "airtable|Airtable"
  "amphetamine|Amphetamine"
  "cardhop|Cardhop"
  "claude|Claude"
  "colorslurp|ColorSlurp"
  "copy-em|Copy 'Em"
  "dropbox|Dropbox"
  "fantastical|Fantastical"
  "geekbench-6|Geekbench 6"
  "google-chrome|Google Chrome"
  "icon-composer|Icon Composer"
  "iina|IINA"
  "iterm|iTerm"
  "keka|Keka"
  "microsoft-excel|Microsoft Excel"
  "microsoft-outlook|Microsoft Outlook"
  "microsoft-teams|Microsoft Teams"
  "microsoft-word|Microsoft Word"
  "numi|Numi"
  "nx-witness|Nx Witness"
  "obsidian|Obsidian"
  "onedrive|OneDrive"
  "pages|Pages"
  "raycast|Raycast"
  "realvnc-connect|RealVNC Connect"
  "remote-desktop|Remote Desktop"
  "safari|Safari"
  "setapp|Setapp"
  "sf-symbols|SF Symbols beta"
  "sonos-s1-controller|Sonos S1 Controller"
  "spotify|Spotify"
  "steermouse|SteerMouse"
  "sublime-merge|Sublime Merge"
  "sublime-text|Sublime Text"
  "tailscale|Tailscale"
  "testflight|TestFlight"
  "things-3|Things3"
  "touchportal|TouchPortal"
  "typora|Typora"
  "vectorworks-cloud-services|Vectorworks Cloud Services"
  "whatsapp|WhatsApp"
  "zoom|zoom.us"
  "cleanmymac|CleanMyMac"
  "cleanshot-x|CleanShot X"
  "istat-menus|iStat Menus"
  "lookaway|LookAway"
  "bartender-5|Bartender 5"
  "atom|Atom"
  "forklift|ForkLift"
  "netspot|NetSpot"
  "inyourface|InYourFace"
  "timing|Timing"
)

extracted=0
skipped=0
failed=0

for mapping in "${MAPPINGS[@]}"; do
  slug="${mapping%%|*}"
  app_name="${mapping#*|}"
  output="$ICONS_DIR/${slug}.png"

  # Try multiple app locations
  app_path=""
  for dir in "/Applications" "/Applications/Setapp" "/System/Applications" "$HOME/Applications"; do
    if [ -d "$dir/${app_name}.app" ]; then
      app_path="$dir/${app_name}.app"
      break
    fi
  done

  if [ -z "$app_path" ]; then
    echo "  ✗ ${slug}: app not found (${app_name}.app)"
    ((failed++))
    continue
  fi

  # Get icon file name from Info.plist
  icon_file=$(defaults read "$app_path/Contents/Info" CFBundleIconFile 2>/dev/null)
  if [ -z "$icon_file" ]; then
    echo "  ✗ ${slug}: no icon file in Info.plist"
    ((failed++))
    continue
  fi

  # Add .icns extension if missing
  [[ "$icon_file" != *.icns ]] && icon_file="${icon_file}.icns"

  icns_path="$app_path/Contents/Resources/$icon_file"
  if [ ! -f "$icns_path" ]; then
    echo "  ✗ ${slug}: icns not found at ${icns_path}"
    ((failed++))
    continue
  fi

  # Convert to 128px PNG
  sips -s format png -Z 128 "$icns_path" --out "$output" > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "  ✓ ${slug}: extracted from ${app_name}"
    ((extracted++))
  else
    echo "  ✗ ${slug}: sips conversion failed"
    ((failed++))
  fi
done

echo ""
echo "Done: ${extracted} extracted, ${skipped} skipped, ${failed} failed"

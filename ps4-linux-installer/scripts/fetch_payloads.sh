#!/usr/bin/env bash
# Fetch PS4 Linux payloads from ArabPixel/ps4-linux-payloads (FW 5.05 - 13.02)
#
# Target hardware: CUH-2115B  (Belize2 A0 / non-pro / non-baikal)
# Target firmware: 12.50
#
# Usage:
#   bash scripts/fetch_payloads.sh
#
# Requires: curl, unzip

set -euo pipefail

RELEASE_URL="https://github.com/ArabPixel/ps4-linux-payloads/releases/download/v21.5/PS4-Linux-Payloads-v21.5.zip"
ZIP_TMP="/tmp/ps4-linux-payloads.zip"
EXTRACT_TMP="/tmp/ps4-linux-payloads"

DEST_DIR="$(cd "$(dirname "$0")/.." && pwd)/assets/payloads"
mkdir -p "$DEST_DIR"

echo "=== PS4 Linux Payload Fetcher ==="
echo "Hardware: CUH-2115B (Belize2 A0, non-pro, non-baikal)"
echo "Firmware: 12.50"
echo ""

# Download release zip
if [ ! -f "$ZIP_TMP" ]; then
    echo "[1/3] Downloading payload release..."
    curl -fSL --progress-bar "$RELEASE_URL" -o "$ZIP_TMP"
else
    echo "[1/3] Using cached $ZIP_TMP"
fi

# Extract
echo "[2/3] Extracting..."
rm -rf "$EXTRACT_TMP"
mkdir -p "$EXTRACT_TMP"
unzip -q "$ZIP_TMP" "fw1250/*" -d "$EXTRACT_TMP"

# Copy the correct variant for CUH-2115B:
#   - Belize2 southbridge  → NOT baikal
#   - PS4 Slim (non-pro)   → NOT pro
#   - 3gb RAM variant      → recommended for 8 GB PS4 systems
echo "[3/3] Installing payload files..."
cp "$EXTRACT_TMP/fw1250/payload-1250-3gb.elf" "$DEST_DIR/payload-12.50.elf"
cp "$EXTRACT_TMP/fw1250/payload-1250-3gb.bin" "$DEST_DIR/payload-12.50.bin"

echo ""
echo "Done! Payload files installed to $DEST_DIR :"
ls -lh "$DEST_DIR"/payload-12.50.*

echo ""
echo "NOTE: GoldHEN v2.4b18.5+ uses the .elf file (preferred)."
echo "      The .bin is kept as a fallback for older GoldHEN."

# Cleanup
rm -rf "$EXTRACT_TMP"

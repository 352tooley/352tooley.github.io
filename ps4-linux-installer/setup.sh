#!/usr/bin/env bash
# PS4 Linux Installer — one-time SDK setup
# Works on Linux and in GitHub Codespaces.
# Run once before building: bash setup.sh

set -e

TOOLCHAIN_DIR="/opt/OpenOrbis/PS4Toolchain"
RELEASE_URL="https://github.com/OpenOrbis/OpenOrbis-PS4-Toolchain/releases/download/v0.5.4/toolchain-llvm-18.tar.gz"
TARBALL="/tmp/ps4-toolchain.tar.gz"

echo "=== PS4 Linux Installer — Build Environment Setup ==="

# Check for required tools
for cmd in clang lld make curl; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "ERROR: '$cmd' not found."
        echo "  Ubuntu/Debian:  sudo apt-get install -y clang lld make curl"
        exit 1
    fi
done

# Helper: run with or without sudo depending on write access
_install() {
    if [ -w "$(dirname "$1")" ] || [ -w "$1" ]; then
        "$@"
    else
        sudo "$@"
    fi
}

# Download and extract toolchain
if [ ! -d "$TOOLCHAIN_DIR/bin/linux" ]; then
    echo "[1/3] Downloading OpenOrbis PS4 Toolchain v0.5.4..."
    curl -fSL --progress-bar "$RELEASE_URL" -o "$TARBALL"

    echo "[2/3] Extracting toolchain to $TOOLCHAIN_DIR..."
    _install mkdir -p /opt/OpenOrbis
    _install tar -xzf "$TARBALL" -C /opt/OpenOrbis --strip-components=1
    rm -f "$TARBALL"
    _install chmod +x "$TOOLCHAIN_DIR/bin/linux/"*
else
    echo "[1/3] Toolchain already present at $TOOLCHAIN_DIR"
    echo "[2/3] Skipped."
fi

# Export environment variable
echo "[3/3] Setting OO_PS4_TOOLCHAIN..."
for RC in "$HOME/.bashrc" "$HOME/.zshrc"; do
    if [ -f "$RC" ] && ! grep -q "OO_PS4_TOOLCHAIN" "$RC"; then
        echo "export OO_PS4_TOOLCHAIN=$TOOLCHAIN_DIR" >> "$RC"
        echo "export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1" >> "$RC"
        echo "  Added to $RC"
    fi
done
export OO_PS4_TOOLCHAIN="$TOOLCHAIN_DIR"
export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

echo ""
echo "=== Setup complete! ==="
echo "OO_PS4_TOOLCHAIN=$TOOLCHAIN_DIR"
echo ""
echo "Run 'source ~/.bashrc' (or open a new terminal), then:"
echo "  make       — build eboot.bin"
echo "  make pkg   — build installable .pkg"

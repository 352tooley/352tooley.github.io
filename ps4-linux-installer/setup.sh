#!/usr/bin/env bash
# PS4 Linux Installer - One-time SDK setup
# Run once before building: bash setup.sh

set -e

TOOLCHAIN_DIR="/opt/OpenOrbis/toolchain"
REPO_URL="https://github.com/OpenOrbis/OpenOrbis-PS4-Toolchain"

echo "=== PS4 Linux Installer - Build Environment Setup ==="

# Check for required tools
for cmd in git clang cmake make; do
    if ! command -v "$cmd" &>/dev/null; then
        echo "ERROR: '$cmd' not found. Install it first."
        exit 1
    fi
done

# Install OpenOrbis SDK
if [ ! -d "$TOOLCHAIN_DIR" ]; then
    echo "[1/3] Cloning OpenOrbis PS4 Toolchain..."
    sudo mkdir -p /opt/OpenOrbis
    sudo chown "$USER" /opt/OpenOrbis
    git clone --depth 1 "$REPO_URL" /opt/OpenOrbis/toolchain
else
    echo "[1/3] OpenOrbis toolchain already present at $TOOLCHAIN_DIR"
fi

# Build toolchain tools if binaries not present
if [ ! -f "$TOOLCHAIN_DIR/bin/create-fself" ]; then
    echo "[2/3] Building create-fself / create-oelf tools..."
    cd "$TOOLCHAIN_DIR/src/tools/create-fself"
    cmake . -B build && cmake --build build
    sudo cp build/create-fself "$TOOLCHAIN_DIR/bin/"

    cd "$TOOLCHAIN_DIR/src/tools/create-oelf"
    cmake . -B build && cmake --build build
    sudo cp build/create-oelf "$TOOLCHAIN_DIR/bin/"
else
    echo "[2/3] Toolchain tools already built."
fi

# Export environment variable
echo "[3/3] Setting OO_PS4_TOOLCHAIN environment variable..."
SHELL_RC=""
if [ -f "$HOME/.bashrc" ]; then SHELL_RC="$HOME/.bashrc"; fi
if [ -f "$HOME/.zshrc" ];  then SHELL_RC="$HOME/.zshrc"; fi

if [ -n "$SHELL_RC" ]; then
    if ! grep -q "OO_PS4_TOOLCHAIN" "$SHELL_RC"; then
        echo "export OO_PS4_TOOLCHAIN=$TOOLCHAIN_DIR" >> "$SHELL_RC"
        echo "Added OO_PS4_TOOLCHAIN to $SHELL_RC"
    else
        echo "OO_PS4_TOOLCHAIN already in $SHELL_RC"
    fi
fi

export OO_PS4_TOOLCHAIN="$TOOLCHAIN_DIR"

echo ""
echo "=== Setup complete! ==="
echo "OO_PS4_TOOLCHAIN=$TOOLCHAIN_DIR"
echo ""
echo "Run 'source ~/.bashrc' (or restart shell), then:"
echo "  make       - build eboot.bin"
echo "  make pkg   - build installable .pkg"


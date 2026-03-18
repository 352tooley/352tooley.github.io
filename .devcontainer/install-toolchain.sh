#!/usr/bin/env bash
# Installs OpenOrbis PS4 Toolchain v0.5.4 into /opt/OpenOrbis/PS4Toolchain
set -e

TOOLCHAIN_DIR="/opt/OpenOrbis/PS4Toolchain"
RELEASE_URL="https://github.com/OpenOrbis/OpenOrbis-PS4-Toolchain/releases/download/v0.5.4/toolchain-llvm-18.tar.gz"
TARBALL="/tmp/ps4-toolchain.tar.gz"

echo "=== PS4 Linux Installer — Codespace Setup ==="

# System deps
echo "[1/4] Installing system dependencies..."
sudo apt-get update -qq
sudo apt-get install -y -qq clang lld make curl
    # PkgTool.Core requires libssl1.1 (not in Ubuntu 22.04 — install from focal)
    curl -fsSL \
        "http://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.24_amd64.deb" \
        -o /tmp/libssl1.1.deb
    sudo dpkg -i /tmp/libssl1.1.deb

# Download toolchain
if [ ! -d "$TOOLCHAIN_DIR/bin/linux" ]; then
    echo "[2/4] Downloading OpenOrbis toolchain v0.5.4..."
    curl -fSL --progress-bar "$RELEASE_URL" -o "$TARBALL"

    echo "[3/4] Extracting toolchain..."
    sudo mkdir -p /opt/OpenOrbis
    sudo tar -xzf "$TARBALL" -C /opt/OpenOrbis --strip-components=1
    rm -f "$TARBALL"
else
    echo "[2/4] Toolchain already present, skipping download."
    echo "[3/4] Skipped."
fi

# Make linux binaries executable
sudo chmod +x "$TOOLCHAIN_DIR/bin/linux/"*

echo "[4/4] Setting up environment..."
export OO_PS4_TOOLCHAIN="$TOOLCHAIN_DIR"
export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

echo ""
echo "=== Setup complete! ==="
echo "OO_PS4_TOOLCHAIN=$TOOLCHAIN_DIR"
echo ""
echo "To build:"
echo "  cd ps4-linux-installer && make"
echo "  cd ps4-linux-installer && make pkg"

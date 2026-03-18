#!/usr/bin/env bash
# Full build → PKG pipeline
# Usage: bash scripts/build_pkg.sh

set -e
cd "$(dirname "$0")/.."

if [ -z "$OO_PS4_TOOLCHAIN" ]; then
    echo "ERROR: OO_PS4_TOOLCHAIN is not set. Run setup.sh first."
    exit 1
fi

echo "=== Building PS4 Linux Installer ==="

# Step 1: Compile
echo "[1/4] Compiling..."
make clean
make -j$(nproc)

# Step 2: Create GP4 project file for PKG builder
echo "[2/4] Generating GP4 project file..."
mkdir -p gp4

cat > gp4/ps4-linux-installer.gp4 << 'EOF'
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<psproject fmt="gp4" version="1000">
  <volume>
    <volume_type>pkg_ps4_app</volume_type>
    <volume_id>PS4LINUX</volume_id>
    <volume_ts>2024-01-01T00:00:00</volume_ts>
    <package content_id="UP0001-LINUXINST00-LINUX0000000001"
             passcode="00000000000000000000000000000000"
             storage_type="digital50"
             app_type="full" />
  </volume>
  <files img_no="0">
    <file targ_path="sce_sys/param.sfo"  orig_path="../sce_sys/param.sfo" />
    <file targ_path="sce_sys/icon0.png"  orig_path="../sce_sys/icon0.png" />
    <file targ_path="eboot.bin"          orig_path="../build/eboot.bin" />
    <dir targ_path="assets" />
  </files>
</psproject>
EOF

# Step 3: Generate param.sfo
echo "[3/4] Generating param.sfo..."
python3 tools/create_param_sfo.py sce_sys/param.sfo

# Step 4: Build PKG
echo "[4/4] Building PKG..."
"$OO_PS4_TOOLCHAIN/bin/create-pkg" pkg_build \
    --contentid "UP0001-LINUXINST00-LINUX0000000001" \
    --type app \
    --passcode "00000000000000000000000000000000" \
    gp4/ps4-linux-installer.gp4 \
    build/ps4-linux-installer.pkg

echo ""
echo "=== Done! ==="
echo "PKG: build/ps4-linux-installer.pkg"
echo "Transfer to PS4 via FTP and install with GoldHEN Package Installer."

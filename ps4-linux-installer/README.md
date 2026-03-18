# PS4 Linux Installer

A self-contained PS4 homebrew PKG that downloads, installs, and boots Linux on a jailbroken PS4 — no PC required.

**Supported firmware:** 5.05 – 12.52
**Distros:** Arch Linux, Xubuntu, Custom URL
**Payload delivery:** GoldHEN BinLoader (TCP 9090)

---

## Requirements

- Jailbroken PS4 with [GoldHEN](https://github.com/GoldHEN/GoldHEN) installed
- Internet connection on the PS4
- Kernel images in `/data/ps4linux/kernels/` (see `assets/kernels/README.md`)
- BinLoader payload binaries in `assets/payloads/` before building (see `assets/payloads/README.md`)

---

## Building

### Option A: GitHub Actions (Recommended — no PC required)

1. Fork/push this repo to GitHub
2. Go to **Actions** tab → wait for the build (~15 min)
3. Download the PKG from **Releases** or **Artifacts**

### Option B: Build Locally

```bash
# One-time setup
bash setup.sh
source ~/.bashrc

# Build eboot.bin
make

# Build installable PKG
bash scripts/build_pkg.sh
```

---

## Installation on PS4

1. Enable GoldHEN on your PS4
2. Transfer `ps4-linux-installer.pkg` to the PS4 via FTP (port 2121)
3. Install via **GoldHEN Package Installer**
4. Launch the app from the PS4 home screen
5. Select a distro and press **X** to install

---

## Project Structure

```
src/
├── main.c                  Entry point
├── config/                 Settings & defaults
├── ui/                     Graphics, menu, progress bar, notifications
├── network/                HTTP download, BinLoader TCP injection
├── storage/                Filesystem, SHA256 integrity, cleanup
└── distros/                Arch, Xubuntu, Custom distro handlers
assets/
├── payloads/               BinLoader payload binaries (user-supplied)
└── kernels/                Linux kernel images (user-supplied)
sce_sys/
├── param.sfo               PKG metadata (auto-generated)
└── icon0.png               App icon
.github/workflows/
└── build-pkg.yml           GitHub Actions CI/CD pipeline
```

---

## Credits

- [OpenOrbis PS4 Toolchain](https://github.com/OpenOrbis/OpenOrbis-PS4-Toolchain)
- [GoldHEN](https://github.com/GoldHEN/GoldHEN) by SiSTR0
- [PS4 Linux](https://github.com/fail0verflow/ps4-linux) by fail0verflow
- PS4Linux community at [ps4linux.com](https://ps4linux.com)

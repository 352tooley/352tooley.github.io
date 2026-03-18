#ifndef DEFAULTS_H
#define DEFAULTS_H

/* BinLoader payload injection */
#define BINLOADER_HOST          "127.0.0.1"
#define BINLOADER_PORT          9090
#define BINLOADER_TIMEOUT_SEC   10

/* Installation paths on PS4 */
#define INSTALL_PATH            "/data/ps4linux/"
#define INSTALL_PATH_ARCH       "/data/ps4linux/arch/"
#define INSTALL_PATH_XUBUNTU    "/data/ps4linux/xubuntu/"
#define INSTALL_PATH_CUSTOM     "/data/ps4linux/custom/"
#define INSTALL_PATH_KERNELS    "/data/ps4linux/kernels/"
#define INSTALL_PATH_PAYLOADS   "/data/ps4linux/payloads/"
#define INSTALL_PATH_TMP        "/data/ps4linux/tmp/"

/* Asset paths within the PKG */
#define ASSET_PATH_PAYLOADS     "/app0/assets/payloads/"
#define ASSET_PATH_KERNELS      "/app0/assets/kernels/"

/* Payload filenames by firmware.
 * GoldHEN v2.4b18.5+ prefers .elf (100% success); .bin is kept as fallback.
 * Run scripts/fetch_payloads.sh to download the correct variant for your hardware. */
#define PAYLOAD_FW_1250_ELF     "payload-12.50.elf"
#define PAYLOAD_FW_1250_BIN     "payload-12.50.bin"
#define PAYLOAD_FW_1252_ELF     "payload-12.52.elf"
#define PAYLOAD_FW_1252_BIN     "payload-12.52.bin"
/* Kept for backward compat */
#define PAYLOAD_FW_1250         PAYLOAD_FW_1250_BIN
#define PAYLOAD_FW_1252         PAYLOAD_FW_1252_BIN
#define PAYLOAD_FW_DEFAULT      PAYLOAD_FW_1250_BIN

/* Arch Linux distro */
#define ARCH_ROOTFS_URL         "http://ps4linux.com/files/archlinux-ps4-rootfs-latest.tar.gz"
#define ARCH_ROOTFS_SHA256      ""   /* fill in when known */
#define ARCH_KERNEL_FILE        "bzImage-arch"
#define ARCH_ROOTFS_FILE        "archlinux-ps4-rootfs.tar.gz"

/* Xubuntu distro */
#define XUBUNTU_ROOTFS_URL      "http://ps4linux.com/files/xubuntu-ps4-rootfs-latest.tar.gz"
#define XUBUNTU_ROOTFS_SHA256   ""   /* fill in when known */
#define XUBUNTU_KERNEL_FILE     "bzImage-xubuntu"
#define XUBUNTU_ROOTFS_FILE     "xubuntu-ps4-rootfs.tar.gz"

/* HTTP download settings */
#define DOWNLOAD_CHUNK_SIZE     (512 * 1024)   /* 512 KB */
#define DOWNLOAD_TIMEOUT_SEC    300

/* UI */
#define SCREEN_WIDTH            1920
#define SCREEN_HEIGHT           1080
#define UI_FPS                  60

/* App metadata */
#define APP_TITLE               "PS4 Linux Installer"
#define APP_VERSION             "1.00"
#define APP_CONTENT_ID          "UP0001-LINUXINST00-LINUX0000000001"

#endif /* DEFAULTS_H */

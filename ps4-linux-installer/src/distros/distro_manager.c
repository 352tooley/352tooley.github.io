#include "distro_manager.h"
#include "arch.h"
#include "xubuntu.h"
#include "custom.h"
#include "../config/defaults.h"
#include <string.h>

static const distro_t s_distros[] = {
    {
        .id          = "arch",
        .name        = "Arch Linux",
        .description = "Minimal rolling-release distro. Lightweight, customizable.",
        .rootfs_url  = ARCH_ROOTFS_URL,
        .rootfs_sha256 = ARCH_ROOTFS_SHA256,
        .kernel_file = ARCH_KERNEL_FILE,
        .install_path = INSTALL_PATH_ARCH,
        .install     = arch_install,
    },
    {
        .id          = "xubuntu",
        .name        = "Xubuntu",
        .description = "Ubuntu with XFCE desktop. Full Linux GUI environment.",
        .rootfs_url  = XUBUNTU_ROOTFS_URL,
        .rootfs_sha256 = XUBUNTU_ROOTFS_SHA256,
        .kernel_file = XUBUNTU_KERNEL_FILE,
        .install_path = INSTALL_PATH_XUBUNTU,
        .install     = xubuntu_install,
    },
    {
        .id          = "custom",
        .name        = "Custom Distro",
        .description = "Enter your own rootfs URL in Settings.",
        .rootfs_url  = NULL,
        .rootfs_sha256 = NULL,
        .kernel_file = NULL,
        .install_path = INSTALL_PATH_CUSTOM,
        .install     = custom_install,
    },
};

#define DISTRO_COUNT ((int)(sizeof(s_distros) / sizeof(s_distros[0])))

const distro_t *distro_get_all(void) { return s_distros; }

int distro_count(void) { return DISTRO_COUNT; }

const distro_t *distro_by_id(const char *id) {
    if (!id) return NULL;
    for (int i = 0; i < DISTRO_COUNT; i++)
        if (strcmp(s_distros[i].id, id) == 0) return &s_distros[i];
    return NULL;
}

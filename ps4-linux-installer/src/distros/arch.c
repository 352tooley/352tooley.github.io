#include "arch.h"
#include "distro_manager.h"
#include "../config/defaults.h"
#include "../network/download.h"
#include "../storage/filesystem.h"
#include "../storage/integrity.h"
#include "../storage/cleanup.h"
#include <stdio.h>
#include <string.h>

typedef struct { progress_cb_t cb; void *ud; size_t total; } dl_ctx_t;

static int dl_progress(size_t done, size_t total, void *ud) {
    dl_ctx_t *ctx = (dl_ctx_t *)ud;
    if (ctx->cb) {
        float pct = (total > 0) ? (float)done / total : 0.0f;
        return ctx->cb((size_t)(pct * 0.6f * 1000000), 1000000, ctx->ud);
    }
    return 0;
}

static int extract_progress(int pct, void *ud) {
    dl_ctx_t *ctx = (dl_ctx_t *)ud;
    if (ctx->cb) {
        /* extraction is 60-95% of overall progress */
        size_t overall = (size_t)(600000 + pct * 3500);
        return ctx->cb(overall, 1000000, ctx->ud);
    }
    return 0;
}

int arch_install(progress_cb_t cb, void *userdata) {
    dl_ctx_t ctx = { cb, userdata, 0 };
    char tmp_archive[512];
    snprintf(tmp_archive, sizeof(tmp_archive), "%s%s", INSTALL_PATH_TMP, ARCH_ROOTFS_FILE);

    /* 1. Create directories */
    fs_mkdir_p(INSTALL_PATH_ARCH);
    fs_mkdir_p(INSTALL_PATH_TMP);

    /* 2. Download rootfs */
    if (cb) cb(0, 1000000, userdata);
    if (download_file(ARCH_ROOTFS_URL, tmp_archive, dl_progress, &ctx) != 0) {
        cleanup_failed_install(INSTALL_PATH_ARCH);
        return -1;
    }

    /* 3. Verify integrity */
    if (cb) cb(620000, 1000000, userdata);
    if (sha256_verify(tmp_archive, ARCH_ROOTFS_SHA256) == 0) {
        fs_remove(tmp_archive);
        cleanup_failed_install(INSTALL_PATH_ARCH);
        return -2; /* checksum mismatch */
    }

    /* 4. Extract rootfs */
    if (fs_extract_tgz(tmp_archive, INSTALL_PATH_ARCH, extract_progress, &ctx) != 0) {
        fs_remove(tmp_archive);
        cleanup_failed_install(INSTALL_PATH_ARCH);
        return -3;
    }
    fs_remove(tmp_archive);

    /* 5. Copy precompiled kernel */
    char kernel_src[512], kernel_dst[512];
    snprintf(kernel_src, sizeof(kernel_src), "%s%s", ASSET_PATH_KERNELS, ARCH_KERNEL_FILE);
    snprintf(kernel_dst, sizeof(kernel_dst), "%s%s", INSTALL_PATH_KERNELS, ARCH_KERNEL_FILE);
    fs_mkdir_p(INSTALL_PATH_KERNELS);
    if (fs_copy(kernel_src, kernel_dst) != 0) return -4;

    /* 6. Write minimal boot config */
    char cfg_path[512];
    snprintf(cfg_path, sizeof(cfg_path), "%sboot.cfg", INSTALL_PATH_ARCH);
    FILE *cfg = fopen(cfg_path, "w");
    if (cfg) {
        fprintf(cfg, "distro=arch\n");
        fprintf(cfg, "kernel=%s%s\n", INSTALL_PATH_KERNELS, ARCH_KERNEL_FILE);
        fprintf(cfg, "rootfs=%s\n", INSTALL_PATH_ARCH);
        fclose(cfg);
    }

    if (cb) cb(1000000, 1000000, userdata);
    return 0;
}

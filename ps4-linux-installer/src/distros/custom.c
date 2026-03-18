#include "custom.h"
#include "distro_manager.h"
#include "../config/defaults.h"
#include "../config/settings.h"
#include "../network/download.h"
#include "../storage/filesystem.h"
#include "../storage/integrity.h"
#include "../storage/cleanup.h"
#include <stdio.h>
#include <string.h>

typedef struct { progress_cb_t cb; void *ud; } dl_ctx_t;

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
        size_t overall = (size_t)(600000 + pct * 3500);
        return ctx->cb(overall, 1000000, ctx->ud);
    }
    return 0;
}

int custom_install(progress_cb_t cb, void *userdata) {
    dl_ctx_t ctx = { cb, userdata };

    settings_t s;
    settings_load(&s);

    if (s.custom_url[0] == '\0') return -1; /* no URL configured */

    char tmp_archive[512];
    snprintf(tmp_archive, sizeof(tmp_archive), "%scustom-rootfs.tar.gz", INSTALL_PATH_TMP);

    fs_mkdir_p(INSTALL_PATH_CUSTOM);
    fs_mkdir_p(INSTALL_PATH_TMP);

    if (cb) cb(0, 1000000, userdata);
    if (download_file(s.custom_url, tmp_archive, dl_progress, &ctx) != 0) {
        cleanup_failed_install(INSTALL_PATH_CUSTOM);
        return -1;
    }

    if (cb) cb(620000, 1000000, userdata);
    if (sha256_verify(tmp_archive, s.custom_sha256) == 0) {
        fs_remove(tmp_archive);
        cleanup_failed_install(INSTALL_PATH_CUSTOM);
        return -2;
    }

    if (fs_extract_tgz(tmp_archive, INSTALL_PATH_CUSTOM, extract_progress, &ctx) != 0) {
        fs_remove(tmp_archive);
        cleanup_failed_install(INSTALL_PATH_CUSTOM);
        return -3;
    }
    fs_remove(tmp_archive);

    /* Copy custom kernel if specified */
    if (s.custom_kernel[0] != '\0') {
        char kernel_src[512], kernel_dst[512];
        snprintf(kernel_src, sizeof(kernel_src), "%s%s", ASSET_PATH_KERNELS, s.custom_kernel);
        snprintf(kernel_dst, sizeof(kernel_dst), "%s%s", INSTALL_PATH_KERNELS, s.custom_kernel);
        fs_mkdir_p(INSTALL_PATH_KERNELS);
        fs_copy(kernel_src, kernel_dst);
    }

    char cfg_path[512];
    snprintf(cfg_path, sizeof(cfg_path), "%sboot.cfg", INSTALL_PATH_CUSTOM);
    FILE *cfg = fopen(cfg_path, "w");
    if (cfg) {
        fprintf(cfg, "distro=custom\n");
        fprintf(cfg, "rootfs=%s\n", INSTALL_PATH_CUSTOM);
        fclose(cfg);
    }

    if (cb) cb(1000000, 1000000, userdata);
    return 0;
}

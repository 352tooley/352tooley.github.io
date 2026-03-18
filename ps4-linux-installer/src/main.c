#include <stdio.h>
#include <string.h>

#include "config/defaults.h"
#include "config/settings.h"
#include "ui/graphics.h"
#include "ui/menu.h"
#include "ui/progress.h"
#include "ui/notifications.h"
#include "network/network_utils.h"
#include "network/binloader.h"
#include "distros/distro_manager.h"
#include "storage/filesystem.h"
#include "storage/cleanup.h"

/* ---- Progress callback passed to install functions ---- */
static int install_progress(size_t done, size_t total, void *ud) {
    (void)ud;
    float pct = (total > 0) ? (float)done / (float)total : 0.0f;
    char label[128];
    snprintf(label, sizeof(label), "Installing... %.0f%%", pct * 100.0f);
    progress_show(label, pct);
    gfx_flip();
    return 0;
}

/* ---- Draw a full-screen status message ---- */
static void draw_status(const char *msg, color_t c) {
    gfx_draw_gradient_bg((color_t){15,15,40,255}, (color_t){5,5,20,255});
    gfx_draw_text(SCREEN_WIDTH/2 - (int)(strlen(msg)*8), SCREEN_HEIGHT/2 - 16, msg, c, 2);
    gfx_flip();
}

/* ---- Run the install flow for selected distro ---- */
static void run_install(int distro_idx) {
    const distro_t *all    = distro_get_all();
    const distro_t *distro = &all[distro_idx];

    draw_status("Preparing installation...", COLOR_WHITE);

    /* Clean any leftover temp files */
    cleanup_tmp();

    /* Initialize networking */
    if (net_init() != 0) {
        notify_show("Network init failed!", 3000);
        draw_status("Network error. Check PS4 internet connection.", COLOR_RED);
        for (int i = 0; i < 180; i++) { notify_tick(); gfx_flip(); }
        return;
    }

    /* Inject BinLoader payload */
    char fw[32];
    binloader_detect_firmware(fw, sizeof(fw));
    const char *payload = binloader_payload_for_firmware(fw);

    if (fs_exists(payload)) {
        char msg[128];
        snprintf(msg, sizeof(msg), "Injecting payload for FW %s...", fw);
        draw_status(msg, COLOR_ACCENT);
        if (binloader_inject(payload) != 0) {
            notify_show("Payload injection failed (BinLoader running?)", 4000);
        } else {
            notify_show("Payload injected!", 2000);
        }
        for (int i = 0; i < 120; i++) { notify_tick(); gfx_flip(); }
    }

    /* Run distro install */
    gfx_draw_gradient_bg((color_t){15,15,40,255}, (color_t){5,5,20,255});
    gfx_draw_text(60, 400, "Installing: ", COLOR_WHITE, 2);
    gfx_draw_text(220, 400, distro->name, COLOR_ACCENT, 2);
    gfx_flip();

    int ret = distro->install(install_progress, NULL);

    progress_hide();

    if (ret == 0) {
        notify_show("Installation complete!", 4000);
        draw_status("Installation complete! Rebooting to Linux...", COLOR_GREEN);
        for (int i = 0; i < 240; i++) { notify_tick(); gfx_flip(); }
        /* Trigger reboot — payload should have set up kexec */
        sceSystemServiceLoadExec("exit", NULL);
    } else {
        char errmsg[128];
        snprintf(errmsg, sizeof(errmsg), "Install failed (error %d)", ret);
        notify_show(errmsg, 5000);
        draw_status(errmsg, COLOR_RED);
        for (int i = 0; i < 300; i++) { notify_tick(); gfx_flip(); }
    }

    net_fini();
}

/* ---- App entry point ---- */
int main(void) {
    /* Initialize subsystems */
    if (gfx_init() != 0) return 1;

    /* Splash screen */
    gfx_draw_gradient_bg((color_t){10,10,30,255}, (color_t){5,5,15,255});
    gfx_draw_text(SCREEN_WIDTH/2 - 360, SCREEN_HEIGHT/2 - 40,
                  APP_TITLE, COLOR_WHITE, 4);
    gfx_draw_text(SCREEN_WIDTH/2 - 100, SCREEN_HEIGHT/2 + 40,
                  "v" APP_VERSION, COLOR_GRAY, 2);
    gfx_flip();

    /* Wait ~1.5s (90 frames at 60fps) */
    for (int i = 0; i < 90; i++) gfx_flip();

    /* Load settings */
    settings_t settings;
    settings_load(&settings);

    /* Ensure install directories exist */
    fs_mkdir_p(INSTALL_PATH);
    fs_mkdir_p(INSTALL_PATH_TMP);

    /* Initialize menu & controller */
    if (menu_init() != 0) {
        draw_status("Controller init failed!", COLOR_RED);
        for (int i = 0; i < 180; i++) gfx_flip();
        gfx_fini();
        return 1;
    }

    /* Main loop */
    while (1) {
        int selected = 0;
        menu_result_t result = menu_run(&selected);

        switch (result) {
        case MENU_RESULT_SELECTED:
            run_install(selected);
            settings.last_distro = (uint8_t)selected;
            settings_save(&settings);
            break;

        case MENU_RESULT_SETTINGS:
            /* TODO: settings screen */
            notify_show("Settings screen coming soon!", 2000);
            break;

        case MENU_RESULT_EXIT:
        case MENU_RESULT_NONE:
        default:
            goto cleanup;
        }
    }

cleanup:
    menu_fini();
    gfx_fini();
    return 0;
}

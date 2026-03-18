#include "menu.h"
#include "graphics.h"
#include "../distros/distro_manager.h"
#include "../config/defaults.h"
#include <string.h>
#include <stdio.h>

#include <orbis/UserService.h>
#include <orbis/Pad.h>

#define ITEM_H      80
#define ITEM_X      400
#define ITEM_Y      200
#define ITEM_W      1120

static int    s_user_id    = -1;
static int    s_pad_handle = -1;
static int    s_cursor     = 0;

/* Button masks */
#define BTN_CROSS    (1 << 14)
#define BTN_CIRCLE   (1 << 13)
#define BTN_TRIANGLE (1 << 12)
#define BTN_DOWN     (1 << 6)
#define BTN_UP       (1 << 7)

int menu_init(void) {
    sceUserServiceInitialize(NULL);
    sceUserServiceGetInitialUser(&s_user_id);
    s_pad_handle = scePadOpen(s_user_id, SCE_PAD_PORT_TYPE_STANDARD, 0, NULL);
    return (s_pad_handle >= 0) ? 0 : -1;
}

void menu_fini(void) {
    if (s_pad_handle >= 0) {
        scePadClose(s_pad_handle);
        s_pad_handle = -1;
    }
}

void menu_draw_header(const char *title) {
    /* Dark header bar */
    gfx_draw_rect(0, 0, SCREEN_WIDTH, 120, (color_t){10, 10, 25, 255});
    gfx_draw_text(60, 40, title, COLOR_WHITE, 3);
    /* Version */
    char ver[64];
    snprintf(ver, sizeof(ver), "v%s", APP_VERSION);
    gfx_draw_text(SCREEN_WIDTH - 160, 50, ver, COLOR_GRAY, 2);
    /* Separator line */
    gfx_draw_rect(0, 118, SCREEN_WIDTH, 2, COLOR_ACCENT);
}

void menu_draw_footer(const char *hint) {
    gfx_draw_rect(0, SCREEN_HEIGHT - 80, SCREEN_WIDTH, 80, (color_t){10, 10, 25, 255});
    gfx_draw_rect(0, SCREEN_HEIGHT - 82, SCREEN_WIDTH, 2, COLOR_GRAY);
    gfx_draw_text(60, SCREEN_HEIGHT - 55, hint, COLOR_GRAY, 2);
}

menu_result_t menu_run(int *selected_distro_out) {
    const distro_t *distros = distro_get_all();
    int count               = distro_count();

    uint32_t prev_buttons = 0;

    while (1) {
        /* Read pad */
        ScePadData pad;
        memset(&pad, 0, sizeof(pad));
        scePadReadState(s_pad_handle, &pad);
        uint32_t pressed = pad.buttons & ~prev_buttons;
        prev_buttons = pad.buttons;

        /* Navigate */
        if (pressed & BTN_DOWN) { s_cursor = (s_cursor + 1) % count; }
        if (pressed & BTN_UP)   { s_cursor = (s_cursor - 1 + count) % count; }
        if (pressed & BTN_CROSS) {
            if (selected_distro_out) *selected_distro_out = s_cursor;
            return MENU_RESULT_SELECTED;
        }
        if (pressed & BTN_TRIANGLE) { return MENU_RESULT_SETTINGS; }
        if (pressed & BTN_CIRCLE)   { return MENU_RESULT_EXIT; }

        /* Draw */
        gfx_draw_gradient_bg((color_t){15, 15, 40, 255}, (color_t){5, 5, 20, 255});
        menu_draw_header(APP_TITLE);
        menu_draw_footer("[X] Install  [Triangle] Settings  [O] Exit");

        /* Subtitle */
        gfx_draw_text(ITEM_X, 145, "Select a Linux distribution to install:", COLOR_GRAY, 2);

        /* Distro list */
        for (int i = 0; i < count; i++) {
            int iy = ITEM_Y + i * (ITEM_H + 10);
            color_t bg   = (i == s_cursor) ? COLOR_ACCENT : (color_t){30, 30, 60, 255};
            color_t text = (i == s_cursor) ? COLOR_DARK   : COLOR_WHITE;

            gfx_draw_rect(ITEM_X, iy, ITEM_W, ITEM_H, bg);
            /* Distro name */
            gfx_draw_text(ITEM_X + 20, iy + 12, distros[i].name, text, 3);
            /* Description */
            gfx_draw_text(ITEM_X + 20, iy + 50, distros[i].description,
                          (i == s_cursor) ? COLOR_DARK : COLOR_GRAY, 1);
        }

        gfx_animate_frame();
        gfx_flip();
    }

    return MENU_RESULT_NONE;
}

#include "progress.h"
#include "graphics.h"
#include "../config/defaults.h"
#include <stdio.h>
#include <string.h>

#define BAR_X   360
#define BAR_Y   500
#define BAR_W   1200
#define BAR_H   40

static int   s_visible = 0;
static char  s_label[256];
static float s_pct;

void progress_show(const char *label, float pct) {
    s_visible = 1;
    if (label) {
        strncpy(s_label, label, sizeof(s_label) - 1);
        s_label[sizeof(s_label) - 1] = '\0';
    }
    s_pct = pct;

    /* Draw label */
    int lx = BAR_X;
    int ly = BAR_Y - 40;
    gfx_draw_rect(lx - 10, ly - 10, BAR_W + 20, 40, (color_t){15, 15, 40, 255});
    gfx_draw_text(lx, ly, s_label, COLOR_WHITE, 2);

    /* Draw bar */
    gfx_draw_progress_bar(BAR_X, BAR_Y, BAR_W, BAR_H, pct, COLOR_DARK, COLOR_ACCENT);

    /* Draw percentage text */
    char pct_str[16];
    snprintf(pct_str, sizeof(pct_str), "%d%%", (int)(pct * 100.0f));
    gfx_draw_text(BAR_X + BAR_W / 2 - 20, BAR_Y + BAR_H + 10, pct_str, COLOR_WHITE, 2);
}

void progress_hide(void) {
    s_visible = 0;
    gfx_draw_rect(BAR_X - 10, BAR_Y - 60, BAR_W + 20, BAR_H + 80, (color_t){15, 15, 40, 255});
}

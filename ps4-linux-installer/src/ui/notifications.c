#include "notifications.h"
#include "graphics.h"
#include "../config/defaults.h"
#include <string.h>
#include <stdio.h>
#include <orbis/SystemService.h>
#include <orbis/libkernel.h>

#define NOTIF_X     60
#define NOTIF_Y     (SCREEN_HEIGHT - 160)
#define NOTIF_W     700
#define NOTIF_H     70

static char  s_msg[256];
static int   s_frames_left = 0;

void notify_show(const char *message, int duration_ms) {
    if (!message) return;
    strncpy(s_msg, message, sizeof(s_msg) - 1);
    s_msg[sizeof(s_msg) - 1] = '\0';
    s_frames_left = (duration_ms * UI_FPS) / 1000;

    /* Also send to system notification tray */
    OrbisNotificationRequest req;
    memset(&req, 0, sizeof(req));
    req.type = NotificationRequest;
    strncpy(req.message, message, sizeof(req.message) - 1);
    sceKernelSendNotificationRequest(0, &req, sizeof(req), 0);
}

void notify_tick(void) {
    if (s_frames_left <= 0) return;
    s_frames_left--;

    /* Toast background */
    color_t bg = {30, 30, 30, 220};
    gfx_draw_rect(NOTIF_X, NOTIF_Y, NOTIF_W, NOTIF_H, bg);
    /* Accent left bar */
    gfx_draw_rect(NOTIF_X, NOTIF_Y, 6, NOTIF_H, COLOR_ACCENT);
    /* Message text */
    gfx_draw_text(NOTIF_X + 16, NOTIF_Y + (NOTIF_H - 16) / 2, s_msg, COLOR_WHITE, 2);
}

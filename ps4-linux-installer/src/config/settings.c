#include "settings.h"
#include "defaults.h"
#include "../storage/filesystem.h"
#include <string.h>
#include <stdio.h>

void settings_defaults(settings_t *s) {
    memset(s, 0, sizeof(*s));
    s->magic       = SETTINGS_MAGIC;
    s->version     = SETTINGS_VER;
    s->last_distro = 0;
    s->auto_inject = 1;
}

int settings_load(settings_t *s) {
    FILE *f = fopen(SETTINGS_PATH, "rb");
    if (!f) {
        settings_defaults(s);
        return 0;
    }
    size_t n = fread(s, 1, sizeof(*s), f);
    fclose(f);
    if (n != sizeof(*s) || s->magic != SETTINGS_MAGIC || s->version != SETTINGS_VER) {
        settings_defaults(s);
        return 0;
    }
    return 1;
}

void settings_save(const settings_t *s) {
    fs_mkdir_p(INSTALL_PATH);
    FILE *f = fopen(SETTINGS_PATH, "wb");
    if (!f) return;
    fwrite(s, 1, sizeof(*s), f);
    fclose(f);
}

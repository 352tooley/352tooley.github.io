#ifndef SETTINGS_H
#define SETTINGS_H

#include <stdint.h>

#define SETTINGS_PATH   "/data/ps4linux/settings.bin"
#define SETTINGS_MAGIC  0x50534C49  /* 'PSLI' */
#define SETTINGS_VER    1

typedef struct {
    uint32_t magic;
    uint32_t version;
    char     custom_url[512];       /* URL for custom distro */
    char     custom_sha256[65];     /* expected SHA256 hex */
    char     custom_kernel[64];     /* kernel filename */
    uint8_t  last_distro;           /* index of last selected distro */
    uint8_t  auto_inject;           /* auto-inject payload on launch */
    uint8_t  reserved[126];
} settings_t;

int  settings_load(settings_t *s);
void settings_save(const settings_t *s);
void settings_defaults(settings_t *s);

#endif /* SETTINGS_H */

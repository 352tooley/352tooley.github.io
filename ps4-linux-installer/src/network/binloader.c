#include "binloader.h"
#include "network_utils.h"
#include "../config/defaults.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <orbis/SystemService.h>
#include <orbis/libkernel.h>

int binloader_inject(const char *payload_path) {
    /* Read payload into memory */
    FILE *f = fopen(payload_path, "rb");
    if (!f) return -1;

    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    fseek(f, 0, SEEK_SET);
    if (size <= 0 || size > 4 * 1024 * 1024) { fclose(f); return -1; }

    uint8_t *buf = (uint8_t *)malloc(size);
    if (!buf) { fclose(f); return -1; }
    if (fread(buf, 1, size, f) != (size_t)size) {
        free(buf); fclose(f); return -1;
    }
    fclose(f);

    /* Connect to BinLoader */
    int sock = net_connect_tcp(BINLOADER_HOST, BINLOADER_PORT, BINLOADER_TIMEOUT_SEC);
    if (sock < 0) { free(buf); return -1; }

    /* Send raw payload bytes */
    int ret = net_send_all(sock, buf, (size_t)size);
    net_close(sock);
    free(buf);
    return ret;
}

int binloader_detect_firmware(char *fw_out, int fw_len) {
    /* Read firmware version via sceKernelGetSystemSwVersion */
    SceKernelSwVersion sw;
    memset(&sw, 0, sizeof(sw));
    sw.size = sizeof(sw);
    if (sceKernelGetSystemSwVersion(&sw) < 0) {
        strncpy(fw_out, "unknown", fw_len - 1);
        return -1;
    }
    /* version_string is like "12.50.00.01-..." */
    strncpy(fw_out, sw.version_string, fw_len - 1);
    fw_out[fw_len - 1] = '\0';
    /* Trim to major.minor (e.g. "12.50") */
    char *dot = strchr(fw_out, '.');
    if (dot) {
        char *dot2 = strchr(dot + 1, '.');
        if (dot2) *dot2 = '\0';
    }
    return 0;
}

/* Return the best available payload path for the given firmware string.
 * Prefers the .elf variant (GoldHEN v2.4b18.5+ — 100% success rate) and
 * falls back to .bin when the .elf is not present in the PKG assets. */
const char *binloader_payload_for_firmware(const char *fw_str) {
    static char path[256];
    const char *elf_name;
    const char *bin_name;

    if (fw_str && strncmp(fw_str, "12.52", 5) == 0) {
        elf_name = PAYLOAD_FW_1252_ELF;
        bin_name = PAYLOAD_FW_1252_BIN;
    } else {
        elf_name = PAYLOAD_FW_1250_ELF;
        bin_name = PAYLOAD_FW_1250_BIN;
    }

    /* Prefer .elf (GoldHEN v2.4b18.5+) */
    snprintf(path, sizeof(path), "%s%s", ASSET_PATH_PAYLOADS, elf_name);
    FILE *probe = fopen(path, "rb");
    if (probe) { fclose(probe); return path; }

    /* Fall back to .bin */
    snprintf(path, sizeof(path), "%s%s", ASSET_PATH_PAYLOADS, bin_name);
    return path;
}

#include "cleanup.h"
#include "filesystem.h"
#include "../config/defaults.h"
#include <dirent.h>
#include <stdio.h>
#include <string.h>

static void remove_dir_recursive(const char *path) {
    DIR *d = opendir(path);
    if (!d) { fs_remove(path); return; }
    struct dirent *ent;
    char buf[512];
    while ((ent = readdir(d)) != NULL) {
        if (strcmp(ent->d_name, ".") == 0 || strcmp(ent->d_name, "..") == 0) continue;
        snprintf(buf, sizeof(buf), "%s/%s", path, ent->d_name);
        if (ent->d_type == DT_DIR) remove_dir_recursive(buf);
        else fs_remove(buf);
    }
    closedir(d);
    /* rmdir equivalent on PS4 */
    sceKernelRmdir(path);
}

void cleanup_tmp(void) {
    remove_dir_recursive(INSTALL_PATH_TMP);
    fs_mkdir_p(INSTALL_PATH_TMP);
}

void cleanup_failed_install(const char *install_path) {
    if (!install_path || install_path[0] == '\0') return;
    remove_dir_recursive(install_path);
}

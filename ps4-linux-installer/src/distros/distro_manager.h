#ifndef DISTRO_MANAGER_H
#define DISTRO_MANAGER_H

#include "../network/download.h"

typedef struct distro distro_t;

typedef int (*install_fn_t)(progress_cb_t cb, void *userdata);

struct distro {
    const char   *id;           /* internal identifier, e.g. "arch" */
    const char   *name;         /* display name, e.g. "Arch Linux" */
    const char   *description;  /* short description */
    const char   *rootfs_url;
    const char   *rootfs_sha256;
    const char   *kernel_file;  /* filename in assets/kernels/ */
    const char   *install_path;
    install_fn_t  install;
};

const distro_t *distro_get_all(void);
int             distro_count(void);
const distro_t *distro_by_id(const char *id);

#endif /* DISTRO_MANAGER_H */

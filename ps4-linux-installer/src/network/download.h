#ifndef DOWNLOAD_H
#define DOWNLOAD_H

#include <stddef.h>

/* progress_cb: called with bytes_done, bytes_total; return 0 to continue, -1 to abort */
typedef int (*progress_cb_t)(size_t bytes_done, size_t bytes_total, void *userdata);

int download_file(const char *url, const char *dest_path,
                  progress_cb_t cb, void *userdata);

#endif /* DOWNLOAD_H */

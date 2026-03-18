#ifndef FILESYSTEM_H
#define FILESYSTEM_H

#include <stddef.h>

/* Create directory and all parents (like mkdir -p) */
int  fs_mkdir_p(const char *path);

/* Copy a file; returns 0 on success */
int  fs_copy(const char *src, const char *dst);

/* Check if file exists */
int  fs_exists(const char *path);

/* Get file size; returns -1 on error */
long fs_size(const char *path);

/* Delete a file */
int  fs_remove(const char *path);

/* Extract a .tar.gz archive to dest_dir */
int  fs_extract_tgz(const char *archive_path, const char *dest_dir,
                    int (*progress_cb)(int pct, void *ud), void *userdata);

#endif /* FILESYSTEM_H */

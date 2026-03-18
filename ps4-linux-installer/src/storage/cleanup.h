#ifndef CLEANUP_H
#define CLEANUP_H

/* Remove all files in the temp directory */
void cleanup_tmp(void);

/* Remove partial/failed install for a given distro path */
void cleanup_failed_install(const char *install_path);

#endif /* CLEANUP_H */

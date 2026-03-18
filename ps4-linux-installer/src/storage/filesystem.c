#include "filesystem.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <errno.h>
#include <orbis/libkernel.h>

int fs_mkdir_p(const char *path) {
    char buf[512];
    strncpy(buf, path, sizeof(buf) - 1);
    buf[sizeof(buf) - 1] = '\0';

    for (char *p = buf + 1; *p; p++) {
        if (*p == '/') {
            *p = '\0';
            sceKernelMkdir(buf, 0777);
            *p = '/';
        }
    }
    return sceKernelMkdir(buf, 0777);
}

int fs_copy(const char *src, const char *dst) {
    FILE *in  = fopen(src, "rb");
    FILE *out = fopen(dst, "wb");
    if (!in || !out) {
        if (in)  fclose(in);
        if (out) fclose(out);
        return -1;
    }
    static uint8_t buf[64 * 1024];
    size_t n;
    int ret = 0;
    while ((n = fread(buf, 1, sizeof(buf), in)) > 0) {
        if (fwrite(buf, 1, n, out) != n) { ret = -1; break; }
    }
    fclose(in);
    fclose(out);
    return ret;
}

int fs_exists(const char *path) {
    struct stat st;
    return (stat(path, &st) == 0) ? 1 : 0;
}

long fs_size(const char *path) {
    struct stat st;
    if (stat(path, &st) != 0) return -1;
    return (long)st.st_size;
}

int fs_remove(const char *path) {
    return remove(path);
}

/* Minimal tar.gz extractor using miniz (single-header zlib, MIT license) */
#define MINIZ_NO_ARCHIVE_APIS
#define MINIZ_NO_STDIO
#include "../miniz.h"

#define GZIP_CHUNK  (256 * 1024)
#define TAR_BLOCK   512

typedef struct {
    char name[100];
    char mode[8];
    char uid[8];
    char gid[8];
    char size[12];
    char mtime[12];
    char checksum[8];
    char type;
    char linkname[100];
    char magic[6];
    char version[2];
    char uname[32];
    char gname[32];
    char devmajor[8];
    char devminor[8];
    char prefix[155];
    char pad[12];
} tar_header_t;

static long octal_to_long(const char *s, int len) {
    long v = 0;
    for (int i = 0; i < len && s[i] >= '0' && s[i] <= '7'; i++)
        v = v * 8 + (s[i] - '0');
    return v;
}

int fs_extract_tgz(const char *archive_path, const char *dest_dir,
                   int (*progress_cb)(int pct, void *ud), void *userdata) {
    /* Decompress with zlib inflate (gzip), parse tar headers */
    FILE *f = fopen(archive_path, "rb");
    if (!f) return -1;

    long arc_size = fs_size(archive_path);

    mz_stream zs;
    memset(&zs, 0, sizeof(zs));
    mz_inflateInit2(&zs, 47); /* 47 = gzip mode */

    static uint8_t in_buf[GZIP_CHUNK];
    static uint8_t out_buf[GZIP_CHUNK];

    /* We write decompressed data into a temp file, then parse tar from it */
    char tmp_path[512];
    snprintf(tmp_path, sizeof(tmp_path), "%s/__tmp_tar.tar", dest_dir);
    fs_mkdir_p(dest_dir);

    FILE *tmp = fopen(tmp_path, "wb");
    if (!tmp) { fclose(f); return -1; }

    int zret;
    long bytes_read = 0;
    do {
        size_t nr = fread(in_buf, 1, sizeof(in_buf), f);
        if (nr == 0) break;
        bytes_read += nr;
        zs.avail_in = (mz_uint32)nr;
        zs.next_in  = in_buf;
        do {
            zs.avail_out = sizeof(out_buf);
            zs.next_out  = out_buf;
            zret = mz_inflate(&zs, MZ_NO_FLUSH);
            if (zret < 0) { fclose(tmp); fclose(f); return -1; }
            size_t have = sizeof(out_buf) - zs.avail_out;
            fwrite(out_buf, 1, have, tmp);
        } while (zs.avail_out == 0);
        if (progress_cb && arc_size > 0)
            progress_cb((int)(bytes_read * 50 / arc_size), userdata);
    } while (zret != MZ_STREAM_END);

    mz_inflateEnd(&zs);
    fclose(tmp);
    fclose(f);

    /* Parse tar */
    FILE *tar = fopen(tmp_path, "rb");
    if (!tar) return -1;

    int ret = 0;
    long total_tar = fs_size(tmp_path);
    long tar_pos   = 0;

    while (1) {
        tar_header_t hdr;
        if (fread(&hdr, 1, TAR_BLOCK, tar) != TAR_BLOCK) break;
        tar_pos += TAR_BLOCK;

        if (hdr.name[0] == '\0') break; /* end-of-archive marker */

        char filepath[512];
        snprintf(filepath, sizeof(filepath), "%s/%s", dest_dir, hdr.name);

        long size = octal_to_long(hdr.size, 12);

        if (hdr.type == '5' || (hdr.type == '\0' && hdr.name[strlen(hdr.name)-1] == '/')) {
            /* Directory */
            fs_mkdir_p(filepath);
        } else if (hdr.type == '0' || hdr.type == '\0') {
            /* Regular file */
            FILE *out = fopen(filepath, "wb");
            long written = 0;
            static uint8_t fb[TAR_BLOCK];
            while (written < size) {
                long to_read = (size - written > TAR_BLOCK) ? TAR_BLOCK : (size - written);
                if (fread(fb, 1, TAR_BLOCK, tar) != TAR_BLOCK) { ret = -1; break; }
                fwrite(fb, 1, to_read, out);
                written    += TAR_BLOCK;
                tar_pos    += TAR_BLOCK;
            }
            if (out) fclose(out);
        } else {
            /* Skip non-regular entries */
            long skip = ((size + TAR_BLOCK - 1) / TAR_BLOCK) * TAR_BLOCK;
            fseek(tar, skip, SEEK_CUR);
            tar_pos += skip;
        }
        if (progress_cb && total_tar > 0)
            progress_cb(50 + (int)(tar_pos * 50 / total_tar), userdata);
    }

    fclose(tar);
    fs_remove(tmp_path);
    return ret;
}

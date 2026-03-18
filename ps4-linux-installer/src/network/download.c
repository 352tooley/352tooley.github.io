#include "download.h"
#include "network_utils.h"
#include "../config/defaults.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <orbis/Net.h>
#include <orbis/Ssl.h>

/* Minimal HTTP/1.1 GET over TCP.
 * Supports http:// only (no TLS) for simplicity with PS4 sockets.
 * For HTTPS, wrap with libSceSsl or route through HTTP proxy on PS4. */

static int parse_url(const char *url,
                     char *host, size_t host_sz,
                     char *path, size_t path_sz,
                     uint16_t *port_out) {
    /* Expect: http://host[:port]/path */
    const char *p = url;
    if (strncmp(p, "http://", 7) == 0)  { p += 7; *port_out = 80; }
    else if (strncmp(p, "https://", 8) == 0) { p += 8; *port_out = 443; }
    else return -1;

    const char *slash = strchr(p, '/');
    size_t hlen = slash ? (size_t)(slash - p) : strlen(p);
    if (hlen >= host_sz) return -1;
    memcpy(host, p, hlen);
    host[hlen] = '\0';

    /* Check for port in host */
    char *colon = strchr(host, ':');
    if (colon) {
        *port_out = (uint16_t)atoi(colon + 1);
        *colon = '\0';
    }

    strncpy(path, slash ? slash : "/", path_sz - 1);
    path[path_sz - 1] = '\0';
    return 0;
}

static long read_content_length(const char *headers) {
    const char *p = strstr(headers, "Content-Length:");
    if (!p) p = strstr(headers, "content-length:");
    if (!p) return -1;
    p += 15;
    while (*p == ' ') p++;
    return atol(p);
}

int download_file(const char *url, const char *dest_path,
                  progress_cb_t cb, void *userdata) {
    char    host[256], path[1024];
    uint16_t port = 80;

    if (parse_url(url, host, sizeof(host), path, sizeof(path), &port) != 0)
        return -1;

    int sock = net_connect_tcp(host, port, DOWNLOAD_TIMEOUT_SEC);
    if (sock < 0) return -1;

    /* Send HTTP GET */
    char req[2048];
    int reqlen = snprintf(req, sizeof(req),
        "GET %s HTTP/1.1\r\n"
        "Host: %s\r\n"
        "Connection: close\r\n"
        "User-Agent: PS4LinuxInstaller/" APP_VERSION "\r\n"
        "\r\n",
        path, host);
    if (net_send_all(sock, req, reqlen) != 0) {
        net_close(sock);
        return -1;
    }

    /* Read response headers */
    char headers[8192];
    int  hpos = 0;
    while (hpos < (int)sizeof(headers) - 1) {
        char c;
        int n = sceNetRecv(sock, &c, 1, 0);
        if (n <= 0) break;
        headers[hpos++] = c;
        if (hpos >= 4 &&
            headers[hpos-4] == '\r' && headers[hpos-3] == '\n' &&
            headers[hpos-2] == '\r' && headers[hpos-1] == '\n')
            break;
    }
    headers[hpos] = '\0';

    /* Check 200 OK */
    if (strncmp(headers, "HTTP/1.1 200", 12) != 0 &&
        strncmp(headers, "HTTP/1.0 200", 12) != 0) {
        net_close(sock);
        return -1;
    }

    long content_length = read_content_length(headers);

    /* Open destination file */
    FILE *f = fopen(dest_path, "wb");
    if (!f) { net_close(sock); return -1; }

    /* Read body in chunks */
    static uint8_t chunk[DOWNLOAD_CHUNK_SIZE];
    size_t total = 0;
    int ret = 0;
    while (1) {
        int n = sceNetRecv(sock, chunk, sizeof(chunk), 0);
        if (n < 0) { ret = -1; break; }
        if (n == 0) break;
        if (fwrite(chunk, 1, n, f) != (size_t)n) { ret = -1; break; }
        total += n;
        if (cb) {
            size_t tot = (content_length > 0) ? (size_t)content_length : total;
            if (cb(total, tot, userdata) != 0) { ret = -1; break; }
        }
    }

    fclose(f);
    net_close(sock);
    return ret;
}

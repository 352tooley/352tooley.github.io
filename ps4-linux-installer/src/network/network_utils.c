#include "network_utils.h"
#include <string.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <orbis/Net.h>
#include <orbis/NetCtl.h>

static int s_net_initialized = 0;

int net_init(void) {
    if (s_net_initialized) return 0;
    /* v0.5.4: sceNetInit takes no arguments */
    if (sceNetInit() < 0)    return -1;
    if (sceNetCtlInit() < 0) return -1;
    s_net_initialized = 1;
    return 0;
}

void net_fini(void) {
    if (!s_net_initialized) return;
    sceNetCtlTerm();
    sceNetTerm();
    s_net_initialized = 0;
}

int net_resolve(const char *host, uint32_t *ip_out) {
    OrbisNetId rid = sceNetResolverCreate("resolver", 0, 0);
    if (rid < 0) return -1;
    OrbisNetInAddr addr;
    int ret = sceNetResolverStartNtoa(rid, host, &addr, 0, 0, 0);
    sceNetResolverDestroy(rid);
    if (ret < 0) return -1;
    *ip_out = addr.s_addr;
    return 0;
}

int net_connect_tcp(const char *host, uint16_t port, int timeout_sec) {
    uint32_t ip = 0;

    /* Try parsing as dotted IP first */
    if (sceNetInetPton(ORBIS_NET_AF_INET, host, &ip) <= 0) {
        if (net_resolve(host, &ip) != 0) return -1;
    }

    int sock = sceNetSocket("tcp_sock", ORBIS_NET_AF_INET, ORBIS_NET_SOCK_STREAM, 0);
    if (sock < 0) return -1;

    /* Set send/recv timeout via BSD socket option constants */
    struct timeval tv = { .tv_sec = timeout_sec, .tv_usec = 0 };
    sceNetSetsockopt(sock, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));
    sceNetSetsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family      = ORBIS_NET_AF_INET;
    addr.sin_port        = sceNetHtons(port);
    addr.sin_addr.s_addr = ip;

    if (sceNetConnect(sock, (OrbisNetSockaddr *)&addr, sizeof(addr)) < 0) {
        sceNetSocketClose(sock);
        return -1;
    }
    return sock;
}

int net_send_all(int sock, const void *buf, size_t len) {
    const uint8_t *p = (const uint8_t *)buf;
    size_t sent = 0;
    while (sent < len) {
        int n = sceNetSend(sock, p + sent, len - sent, 0);
        if (n <= 0) return -1;
        sent += n;
    }
    return 0;
}

int net_recv_all(int sock, void *buf, size_t len) {
    uint8_t *p = (uint8_t *)buf;
    size_t recvd = 0;
    while (recvd < len) {
        int n = sceNetRecv(sock, p + recvd, len - recvd, 0);
        if (n <= 0) return -1;
        recvd += n;
    }
    return 0;
}

void net_close(int sock) {
    if (sock >= 0) sceNetSocketClose(sock);
}

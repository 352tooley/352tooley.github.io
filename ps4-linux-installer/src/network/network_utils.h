#ifndef NETWORK_UTILS_H
#define NETWORK_UTILS_H

#include <stdint.h>
#include <stddef.h>

int  net_init(void);
void net_fini(void);

/* Resolve hostname to IPv4, returns 0 on success */
int  net_resolve(const char *host, uint32_t *ip_out);

/* Connect TCP socket, returns socket fd or -1 */
int  net_connect_tcp(const char *host, uint16_t port, int timeout_sec);

/* Send/receive helpers */
int  net_send_all(int sock, const void *buf, size_t len);
int  net_recv_all(int sock, void *buf, size_t len);

void net_close(int sock);

#endif /* NETWORK_UTILS_H */

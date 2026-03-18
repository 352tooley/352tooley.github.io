#ifndef NOTIFICATIONS_H
#define NOTIFICATIONS_H

void notify_show(const char *message, int duration_ms);
void notify_tick(void);   /* call each frame to handle expiry */

#endif /* NOTIFICATIONS_H */

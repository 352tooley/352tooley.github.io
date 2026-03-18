#ifndef MENU_H
#define MENU_H

#include "../distros/distro_manager.h"

typedef enum {
    MENU_RESULT_NONE = 0,
    MENU_RESULT_SELECTED,
    MENU_RESULT_BACK,
    MENU_RESULT_SETTINGS,
    MENU_RESULT_EXIT,
} menu_result_t;

int          menu_init(void);
void         menu_fini(void);
menu_result_t menu_run(int *selected_distro_out);
void         menu_draw_header(const char *title);
void         menu_draw_footer(const char *hint);

#endif /* MENU_H */

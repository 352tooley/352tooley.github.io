#ifndef GRAPHICS_H
#define GRAPHICS_H

#include <stdint.h>

typedef struct { uint8_t r, g, b, a; } color_t;

#define COLOR_BLACK     ((color_t){0,   0,   0,   255})
#define COLOR_WHITE     ((color_t){255, 255, 255, 255})
#define COLOR_BLUE      ((color_t){0,   120, 215, 255})
#define COLOR_GREEN     ((color_t){0,   200, 80,  255})
#define COLOR_RED       ((color_t){220, 50,  50,  255})
#define COLOR_GRAY      ((color_t){80,  80,  80,  255})
#define COLOR_DARK      ((color_t){20,  20,  35,  255})
#define COLOR_ACCENT    ((color_t){100, 180, 255, 255})

int  gfx_init(void);
void gfx_fini(void);
void gfx_clear(color_t c);
void gfx_flip(void);

void gfx_draw_rect(int x, int y, int w, int h, color_t c);
void gfx_draw_text(int x, int y, const char *text, color_t c, int size);
void gfx_draw_progress_bar(int x, int y, int w, int h, float pct, color_t bg, color_t fg);
void gfx_draw_gradient_bg(color_t top, color_t bottom);
void gfx_draw_image(int x, int y, int w, int h, const void *rgba_data);

/* Animation helpers */
void gfx_animate_frame(void);   /* call each frame to tick animations */

#endif /* GRAPHICS_H */

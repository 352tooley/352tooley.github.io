# PS4 Linux Installer - Makefile
# Requires OpenOrbis PS4 Toolchain v0.5.4+
# Set OO_PS4_TOOLCHAIN to the toolchain root, or export it before running make.

OO_PS4_TOOLCHAIN ?= /opt/OpenOrbis/PS4Toolchain

# --- Toolchain tools (v0.5.4: create-fself does OELF+eboot in one step) ---
TOOLBIN = $(OO_PS4_TOOLCHAIN)/bin/linux
CC      = clang
LD      = ld.lld
FSELF   = $(TOOLBIN)/create-fself
MKGP4   = $(TOOLBIN)/create-gp4
PKGTOOL = DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1 $(TOOLBIN)/PkgTool.Core

# --- Project metadata ---
TITLE      = PS4 Linux Installer
VERSION    = 1.00
TITLE_ID   = BREW00352
CONTENT_ID = UP0001-BREW00352_00-LINUXINSTALLER01
TARGET     = ps4-linux-installer

# --- Paths ---
ODIR = build/obj
BDIR = build

# --- Compile flags (v0.5.4 target triple) ---
CFLAGS = \
    --target=x86_64-pc-freebsd12-elf \
    -fPIC \
    -funwind-tables \
    -O2 \
    -Wall \
    -Wno-unused-function \
    -isysroot $(OO_PS4_TOOLCHAIN) \
    -isystem $(OO_PS4_TOOLCHAIN)/include \
    -I src

# --- Linker flags ---
LDFLAGS = \
    -m elf_x86_64 \
    -pie \
    --script $(OO_PS4_TOOLCHAIN)/link.x \
    --eh-frame-hdr \
    -L$(OO_PS4_TOOLCHAIN)/lib \
    -lSceVideoOut \
    -lSceUserService \
    -lScePad \
    -lSceNet \
    -lSceNetCtl \
    -lSceSsl \
    -lSceSystemService \
    -lSceAppInstUtil \
    -lkernel \
    -lc \
    -lc++ \
    $(OO_PS4_TOOLCHAIN)/lib/crt1.o

# --- Sources ---
SRCS = \
    src/miniz.c \
    src/main.c \
    src/config/settings.c \
    src/ui/graphics.c \
    src/ui/menu.c \
    src/ui/progress.c \
    src/ui/notifications.c \
    src/network/download.c \
    src/network/binloader.c \
    src/network/network_utils.c \
    src/storage/filesystem.c \
    src/storage/integrity.c \
    src/storage/cleanup.c \
    src/distros/distro_manager.c \
    src/distros/arch.c \
    src/distros/xubuntu.c \
    src/distros/custom.c

OBJS = $(patsubst src/%.c,$(ODIR)/%.o,$(SRCS))

.PHONY: all pkg clean dirs sfo

all: dirs $(BDIR)/eboot.bin

dirs:
	@mkdir -p $(ODIR)/config $(ODIR)/ui $(ODIR)/network $(ODIR)/storage $(ODIR)/distros

# Compile each .c → .o
$(ODIR)/%.o: src/%.c
	$(CC) $(CFLAGS) -c $< -o $@

# Link objects → ELF
$(BDIR)/$(TARGET).elf: $(OBJS)
	$(LD) $(OBJS) -o $@ $(LDFLAGS)

# create-fself v0.5.4: one step produces both OELF and eboot.bin
$(BDIR)/eboot.bin: $(BDIR)/$(TARGET).elf
	$(FSELF) \
	    -in=$(BDIR)/$(TARGET).elf \
	    -out=$(BDIR)/$(TARGET).oelf \
	    --eboot $@ \
	    --paid 0x3800000000000011

# Generate param.sfo via PkgTool.Core (written to sce_sys/ so GP4 picks it up)
sce_sys/param.sfo:
	$(PKGTOOL) sfo_new $@
	$(PKGTOOL) sfo_setentry $@ APP_TYPE      --type Integer --maxsize 4   --value 1
	$(PKGTOOL) sfo_setentry $@ APP_VER       --type Utf8    --maxsize 8   --value '$(VERSION)'
	$(PKGTOOL) sfo_setentry $@ ATTRIBUTE     --type Integer --maxsize 4   --value 0
	$(PKGTOOL) sfo_setentry $@ CATEGORY      --type Utf8    --maxsize 4   --value 'gd'
	$(PKGTOOL) sfo_setentry $@ CONTENT_ID    --type Utf8    --maxsize 48  --value '$(CONTENT_ID)'
	$(PKGTOOL) sfo_setentry $@ DOWNLOAD_DATA_SIZE --type Integer --maxsize 4 --value 0
	$(PKGTOOL) sfo_setentry $@ SYSTEM_VER    --type Integer --maxsize 4   --value 0
	$(PKGTOOL) sfo_setentry $@ TITLE         --type Utf8    --maxsize 128 --value '$(TITLE)'
	$(PKGTOOL) sfo_setentry $@ TITLE_ID      --type Utf8    --maxsize 12  --value '$(TITLE_ID)'
	$(PKGTOOL) sfo_setentry $@ VERSION       --type Utf8    --maxsize 8   --value '$(VERSION)'

# Auto-generate GP4 and build PKG
# Stage all files into build/pkg/ with the correct in-package layout first,
# so create-gp4 generates paths relative to that directory and PkgTool.Core
# can find eboot.bin at the package root (not inside a build/ subdir).
PKGDIR = $(BDIR)/pkg

pkg: all sce_sys/param.sfo
	@echo "Staging package files..."
	@mkdir -p $(PKGDIR)/sce_sys/about
	@cp $(BDIR)/eboot.bin      $(PKGDIR)/eboot.bin
	@cp sce_sys/param.sfo      $(PKGDIR)/sce_sys/param.sfo
	@cp sce_sys/icon0.png      $(PKGDIR)/sce_sys/icon0.png
	@cp sce_sys/about/right.sprx $(PKGDIR)/sce_sys/about/right.sprx
	@echo "Generating GP4..."
	cd $(PKGDIR) && $(MKGP4) \
	    -out $(TARGET).gp4 \
	    -content-id $(CONTENT_ID) \
	    -files "eboot.bin sce_sys/param.sfo sce_sys/icon0.png sce_sys/about/right.sprx"
	@echo "Building PKG..."
	$(PKGTOOL) pkg_build $(PKGDIR)/$(TARGET).gp4 $(BDIR)
	@echo ""
	@echo "PKG built: $(BDIR)/$(CONTENT_ID).pkg"

clean:
	rm -rf build/

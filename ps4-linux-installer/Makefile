# PS4 Linux Installer - Makefile
# Requires OpenOrbis PS4 Toolchain (run setup.sh first)

OO_PS4_TOOLCHAIN ?= /opt/OpenOrbis/toolchain

CC      = $(OO_PS4_TOOLCHAIN)/bin/clang
CXX     = $(OO_PS4_TOOLCHAIN)/bin/clang++
LINKER  = $(OO_PS4_TOOLCHAIN)/bin/ld.lld
OELF    = $(OO_PS4_TOOLCHAIN)/bin/create-oelf
FSELF   = $(OO_PS4_TOOLCHAIN)/bin/create-fself
PKG     = $(OO_PS4_TOOLCHAIN)/bin/create-pkg
SFOXML  = $(OO_PS4_TOOLCHAIN)/bin/PkgTool.Core

TARGET  = ps4-linux-installer
ODIR    = build/obj
BDIR    = build

CFLAGS  = \
    -target x86_64-scei-ps4 \
    -O2 \
    -Wall \
    -Wno-unused-function \
    -fPIC \
    -isystem $(OO_PS4_TOOLCHAIN)/include \
    -I$(OO_PS4_TOOLCHAIN)/include \
    -I src

LIBS    = \
    -L $(OO_PS4_TOOLCHAIN)/lib \
    -lSceVideoOut_stub_weak \
    -lSceUserService_stub_weak \
    -lScePad_stub_weak \
    -lSceNet_stub_weak \
    -lSceNetCtl_stub_weak \
    -lSceSsl_stub_weak \
    -lSceSystemService_stub_weak \
    -lSceAppInstUtil_stub_weak \
    -lSceKernelModuleService_stub_weak \
    -lkernel_stub_weak \
    -lc \
    -lc++

SRCS = \
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

.PHONY: all pkg clean dirs

all: dirs $(BDIR)/eboot.bin

dirs:
	@mkdir -p $(ODIR)/config $(ODIR)/ui $(ODIR)/network $(ODIR)/storage $(ODIR)/distros

$(ODIR)/%.o: src/%.c
	$(CC) $(CFLAGS) -c $< -o $@

$(BDIR)/$(TARGET).elf: $(OBJS)
	$(LINKER) -m elf_x86_64 \
	    -pie \
	    --script $(OO_PS4_TOOLCHAIN)/link.x \
	    -o $@ $(OBJS) $(LIBS)

$(BDIR)/$(TARGET).oelf: $(BDIR)/$(TARGET).elf
	$(OELF) --in $(BDIR)/$(TARGET).elf --out $@

$(BDIR)/eboot.bin: $(BDIR)/$(TARGET).oelf
	$(FSELF) $(BDIR)/$(TARGET).oelf $@

pkg: all
	@echo "Building PKG..."
	@cp sce_sys/param.sfo $(BDIR)/param.sfo
	$(PKG) pkg_build \
	    --contentid UP0001-$(TARGET)_00-LINUX0INSTALLER01 \
	    --type app \
	    --passcode 00000000000000000000000000000000 \
	    gp4/$(TARGET).gp4 \
	    $(BDIR)/$(TARGET).pkg
	@echo "PKG built: $(BDIR)/$(TARGET).pkg"

clean:
	rm -rf build/


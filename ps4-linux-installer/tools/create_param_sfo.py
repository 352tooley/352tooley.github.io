#!/usr/bin/env python3
"""Generate a PS4 param.sfo binary file."""
import struct
import sys
import os

def make_param_sfo(output_path):
    # SFO entries: (key, fmt, max_len, value)
    # fmt: 0x0004 = UTF-8 (not null-term), 0x0204 = UTF-8 (null-term), 0x0404 = uint32
    entries = [
        ("APP_VER",          0x0204, 8,    "01.00"),
        ("ATTRIBUTE",        0x0404, 4,    0),
        ("CATEGORY",         0x0204, 4,    "gd"),
        ("CONTENT_ID",       0x0204, 48,   "UP0001-LINUXINST00-LINUX0000000001"),
        ("DOWNLOAD_DATA_SIZE",0x0404, 4,   0),
        ("FORMAT",           0x0204, 4,    "obs"),
        ("PARENTAL_LEVEL",   0x0404, 4,    1),
        ("PUBTOOLINFO",      0x0204, 512,  "create_param_ver=0120,sdk_ver=09508001"),
        ("TITLE",            0x0204, 128,  "PS4 Linux Installer"),
        ("TITLE_ID",         0x0204, 12,   "LINUXINST0"),
        ("VERSION",          0x0204, 8,    "01.00"),
    ]
    entries.sort(key=lambda e: e[0])

    num_entries = len(entries)
    key_table_start  = 20 + num_entries * 16
    # compute key offsets
    key_offsets = []
    ko = 0
    for e in entries:
        key_offsets.append(ko)
        ko += len(e[0]) + 1

    key_table_size = ko
    # pad key table to 4 bytes
    key_table_padded = (key_table_size + 3) & ~3

    data_table_start = key_table_start + key_table_padded
    data_offsets = []
    do = 0
    data_values = []
    for e in entries:
        data_offsets.append(do)
        if e[1] == 0x0404:
            data_values.append(struct.pack('<I', e[3]))
            do += 4
        else:
            val = e[3].encode('utf-8') + b'\x00'
            padded = val.ljust(e[2], b'\x00')
            data_values.append(padded)
            do += e[2]

    data_table_size = do

    # Header
    sfo  = b'\x00PSF'                          # magic
    sfo += struct.pack('<I', 0x00000101)        # version
    sfo += struct.pack('<I', key_table_start)
    sfo += struct.pack('<I', data_table_start)
    sfo += struct.pack('<I', num_entries)

    # Index table
    for i, e in enumerate(entries):
        key_off  = key_offsets[i]
        data_fmt = e[1]
        if data_fmt == 0x0404:
            data_len = 4
            data_max = 4
        else:
            data_len = len(e[3].encode('utf-8')) + 1
            data_max = e[2]
        data_off = data_offsets[i]
        sfo += struct.pack('<HHIII', key_off, data_fmt, data_len, data_max, data_off)

    # Key table
    for e in entries:
        sfo += e[0].encode('utf-8') + b'\x00'
    # Pad
    while len(sfo) < data_table_start:
        sfo += b'\x00'

    # Data table
    for v in data_values:
        sfo += v

    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(sfo)
    print(f"param.sfo written to {output_path} ({len(sfo)} bytes)")

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else 'sce_sys/param.sfo'
    make_param_sfo(out)

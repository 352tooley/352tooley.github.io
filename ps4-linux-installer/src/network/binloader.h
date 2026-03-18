#ifndef BINLOADER_H
#define BINLOADER_H

/* Inject a payload binary to GoldHEN's BinLoader (TCP 127.0.0.1:9090) */
int binloader_inject(const char *payload_path);

/* Detect firmware version string, e.g. "12.50" */
int binloader_detect_firmware(char *fw_out, int fw_len);

/* Return path to the appropriate payload for current firmware */
const char *binloader_payload_for_firmware(const char *fw_str);

#endif /* BINLOADER_H */

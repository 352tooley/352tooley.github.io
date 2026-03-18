#ifndef INTEGRITY_H
#define INTEGRITY_H

/* Verify file SHA256 matches expected hex string.
 * Returns 1 if match, 0 if mismatch, -1 on error. */
int sha256_verify(const char *file_path, const char *expected_hex);

/* Compute SHA256 of file and write 65-byte hex string (null-terminated) to out_hex */
int sha256_file(const char *file_path, char out_hex[65]);

#endif /* INTEGRITY_H */

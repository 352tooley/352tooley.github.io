#!/usr/bin/env bash
# Test payload injection via netcat (simulates BinLoader)
# Usage: bash scripts/send_payload.sh [payload_path] [host] [port]
#
# On your PS4, ensure GoldHEN is running with BinLoader enabled.
# Default target: 192.168.1.x:9090  (set PS4_IP env var or pass as arg)

PAYLOAD="${1:-assets/payloads/payload-12.50.bin}"
HOST="${2:-${PS4_IP:-192.168.1.100}}"
PORT="${3:-9090}"

if [ ! -f "$PAYLOAD" ]; then
    echo "ERROR: Payload not found: $PAYLOAD"
    echo "Place your payload binary in assets/payloads/ first."
    exit 1
fi

if ! command -v nc &>/dev/null; then
    echo "ERROR: 'nc' (netcat) not found. Install it first."
    exit 1
fi

echo "Sending payload: $PAYLOAD"
echo "Target: $HOST:$PORT"
echo ""

nc -w 5 "$HOST" "$PORT" < "$PAYLOAD"
if [ $? -eq 0 ]; then
    echo "Payload sent successfully!"
else
    echo "ERROR: Could not connect to $HOST:$PORT"
    echo "Check that GoldHEN BinLoader is running on the PS4."
fi

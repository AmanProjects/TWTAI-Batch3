#!/usr/bin/env bash
# Monitor command: runs for the lifetime of the session.
# Every line it prints to stdout reaches Claude as a notification.
#
# This one watches for a docs build artifact appearing. Replace the body with
# `tail -F ./logs/build.log` or a curl poll against your CI once you have one.

set -uo pipefail

last=""
while true; do
  if [ -f "./site/.build-status" ]; then
    now="$(cat ./site/.build-status 2>/dev/null || echo '')"
    if [ "$now" != "$last" ]; then
      echo "docs build status: $now"
      last="$now"
    fi
  fi
  sleep 15
done

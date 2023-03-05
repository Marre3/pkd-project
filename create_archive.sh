#!/usr/bin/env bash
set -xe
archive_name=${1:-"pkd-chess.zip"}
root=$(git rev-parse --show-toplevel)
cd "${root}" || exit 1
rm -rf build
mkdir -p build
git archive -o "build/${archive_name}" main

# Verify package
cd build || exit 1
rm -rf verification
mkdir -p verification
unzip -o "${archive_name}" -d verification
cd verification
deno task test

echo "Successfully created ${archive_name}"

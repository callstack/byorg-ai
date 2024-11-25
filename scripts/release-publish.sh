#! /bin/bash
# See: https://pnpm.io/using-changesets#releasing-changes

set -e

pnpm publish --recursive --filter @callstack/* --access public
pnpm changeset tag
echo "Done."
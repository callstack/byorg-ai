#! /bin/bash
# Based on: https://github.com/changesets/changesets/issues/432#issuecomment-1258264936

set -e

pnpm validate
pnpm build

pnpm changeset version
pnpm publish --recursive --filter @callstack/* --access public --dry-run
pnpm changeset tag

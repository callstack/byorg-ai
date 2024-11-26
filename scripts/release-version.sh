#! /bin/bash
# See: https://pnpm.io/using-changesets#releasing-changes

set -e

pnpm validate
pnpm build

pnpm changeset version
pnpm install

echo "\nReview and commit changelog files 👀"

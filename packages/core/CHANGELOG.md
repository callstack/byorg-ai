# @callstack/byorg-core

## 0.8.1

### Patch Changes

- @callstack/byorg-utils@0.8.1

## 0.8.0

### Minor Changes

- 21d4f2e: core: expose `ChatModel.name` property

### Patch Changes

- cb21f9a: Fixed missing references
- Updated dependencies [ea21cc7]
  - @callstack/byorg-utils@0.8.0

## 0.7.0

### Minor Changes

- 3770dfb: core: chatModel is customizable using RequestContext, removed default maxTokens and maxSteps values
- 4463e11: core: pass delta as 2nd param to onPartialUpdate

### Patch Changes

- 6152fb3: core: fix for a case when user message isn't the newest one
- d6b3e3a: core: reduce some of the startup logs severity to debug
- Updated dependencies [d6b3e3a]
  - @callstack/byorg-utils@0.7.0

## 0.6.0

### Minor Changes

- 287c02b: core: make systemPrompt both optional and sync-only
- 02bd239: core: allow for dynamic model selection
- bf009e8: core: mock chat model for testing setup

### Patch Changes

- @callstack/byorg-utils@0.6.0

## 0.5.0

### Patch Changes

- @callstack/byorg-utils@0.5.0

## 0.4.2

### Patch Changes

- @callstack/byorg-utils@0.4.2

## 0.4.1

### Patch Changes

- @callstack/byorg-utils@0.4.1

## 0.4.0

### Minor Changes

- e4c7a51: move 'ai' as peer dep, remove redundant Open AI and Anthropic deps.
- dd789a6: do not add sender id prefix for assistant group messages

### Patch Changes

- 17863b6: Pass context object to error handler.
- d8c092c: add missing exports (Middleware, etc), rename `addReference` to `addReferences`.
  - @callstack/byorg-utils@0.4.0

## 0.3.1

### Patch Changes

- 3fb9634: add explicit "exports" key to package.json
- Updated dependencies [3fb9634]
  - @callstack/byorg-utils@0.3.1

## 0.3.0

### Minor Changes

- 6b49f52: moved group message formatting from core to slack package
  improve logic for group message formatting and entity resolving

### Patch Changes

- fe63967: added package metadata: authors, repo
- Updated dependencies [6b49f52]
- Updated dependencies [fe63967]
  - @callstack/byorg-utils@0.3.0

## 0.2.0

### Patch Changes

- 45f48db: chore: update deps
  - @callstack/byorg-utils@0.2.0

## 0.1.2

### Patch Changes

- 5acde4c: Add missing export for "getReferenceStorage"
  - @callstack/byorg-utils@0.1.2

## 0.1.1

### Patch Changes

- b1a5d1a: Tweaked packaged files.
- Updated dependencies [b1a5d1a]
  - @callstack/byorg-utils@0.1.1

## 0.1.0

### Minor Changes

- 0cd9689: Initial release.

### Patch Changes

- Updated dependencies [0cd9689]
  - @callstack/byorg-utils@0.1.0

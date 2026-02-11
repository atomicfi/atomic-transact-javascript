# Release Process

## Overview

Publishing a new version of `@atomicfi/transact-javascript` to npm is driven entirely by GitHub Releases. No manual version bumps or npm commands are needed.

## How to Release

1. **Create a GitHub Release** in the [atomicfi/atomic-transact-javascript](https://github.com/atomicfi/atomic-transact-javascript) repository.
2. **Set the tag** to the desired version (e.g., `3.0.11` or `v3.0.11`). A leading `v` prefix is automatically stripped.
3. **Publish the release.** This triggers the `publish` workflow.

## What Happens

When a release is published, the [publish workflow](../.github/workflows/publish.yml) runs the following steps:

1. **Set version** - `npm version` updates `package.json` to match the release tag.
2. **Install dependencies** - `npm ci` installs dependencies from the lockfile.
3. **Publish to npm** - `npm publish` publishes the package. Before publishing, the `prepublishOnly` script automatically:
   - Runs `scripts/update-version.js` to replace the `__VERSION__` placeholder in `index.js` with the release version.
   - Runs `tsc` to generate TypeScript declaration files.

## npm Trusted Publishing

This repository uses [npm trusted publishing](https://docs.npmjs.com/generating-provenance-statements) (also known as provenance-based publishing) to authenticate with npm. Instead of storing a long-lived npm access token, the workflow uses GitHub Actions' OIDC `id-token: write` permission to request a short-lived token directly from npm. This means:

- No manual npm token rotation is required.
- Published packages include provenance statements linking them back to this repository and the specific workflow run.
- Only this repository's GitHub Actions workflows can publish to the `@atomicfi/transact-javascript` package.

## Notes

- The release tag is the single source of truth for the published version.
- There is no need to manually update the version in `package.json` or `index.js`.
- The workflow only triggers on the `release: published` event.

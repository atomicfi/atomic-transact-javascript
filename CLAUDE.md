# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Atomic Transact JavaScript SDK, a browser-based SDK that enables integration with Atomic's financial services through an iframe-based widget. The SDK provides a simple API to launch the Transact experience and handle callbacks for user interactions.

## Development Commands

- **Test**: `npm test` - Runs Vitest test suite
- **Build TypeScript definitions**: `npx tsc` - Generates TypeScript declaration files from JavaScript source
- **Publish**: `npm run publish-it` - Compiles TypeScript definitions and publishes to npm

## Architecture

### Core Structure
- **index.js**: Main SDK implementation - single file containing the complete SDK
- **index.d.ts**: TypeScript definitions (auto-generated from index.js via JSDoc comments)
- **test/index.spec.js**: Vitest test suite with snapshots

### SDK Architecture
The SDK follows a simple pattern:
1. **atomicSDK.transact()**: Main entry point that creates an iframe and handles configuration
2. **_handleIFrameEvent()**: PostMessage event handler for iframe communication
3. **_removeTransact()**: Cleanup function for removing iframe and event listeners

### Key Components
- **iframe Management**: Creates and styles iframe elements, supports both modal and container modes
- **PostMessage Communication**: Bidirectional communication with Transact iframe using postMessage API
- **Event Callbacks**: onInteraction, onDataRequest, onFinish, onClose callbacks for different SDK events
- **Product Constants**: Predefined product types (DEPOSIT, VERIFY, IDENTIFY, WITHHOLD)

### Configuration
- **Origin Override**: `environmentOverride` parameter allows pointing to different Transact environments
- **Platform Metadata**: SDK automatically includes platform information (browser, SDK version, system details)
- **Container Support**: Can render as modal overlay or embedded in specific DOM container

## Code Style

- Uses Prettier with specific config: no semicolons, single quotes, 2-space tabs, no trailing commas
- TypeScript definitions generated from JSDoc comments in JavaScript source
- Vitest for testing with snapshot testing for DOM elements

## SDK Version Management

The SDK version is hardcoded in index.js:52 and should be kept in sync with package.json version. This version is sent to Transact servers as part of platform metadata.
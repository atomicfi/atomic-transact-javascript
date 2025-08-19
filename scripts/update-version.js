#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Read version from package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const version = packageJson.version

// Read index.js
const indexPath = path.join(__dirname, '..', 'index.js')
const indexContent = fs.readFileSync(indexPath, 'utf8')

// Replace version placeholder with actual version
const updatedContent = indexContent.replace(/'__VERSION__'/g, `'${version}'`)

// Write updated content back
fs.writeFileSync(indexPath, updatedContent, 'utf8')

console.log(`Updated SDK version to ${version}`)
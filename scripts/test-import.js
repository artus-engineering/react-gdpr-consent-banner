#!/usr/bin/env node

/**
 * Standalone script to test package imports
 * This script can be run independently to verify that the package works correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing package imports...\n');

try {
  // Test CJS import
  console.log('📦 Testing CommonJS import...');
  const cjsExports = require('../dist/cjs/index.js');
  console.log('✅ CommonJS import successful');
  
  // Test ESM import (simulated)
  console.log('📦 Testing ESM build...');
  const esmPath = path.join(__dirname, '../dist/esm/index.js');
  if (fs.existsSync(esmPath)) {
    console.log('✅ ESM build exists');
  } else {
    throw new Error('ESM build not found');
  }
  
  // Check for CSS import issues
  console.log('🎨 Checking for CSS import issues...');
  const cjsContent = fs.readFileSync(path.join(__dirname, '../dist/cjs/index.js'), 'utf8');
  const esmContent = fs.readFileSync(path.join(__dirname, '../dist/esm/index.js'), 'utf8');
  
  if (cjsContent.includes('require("./index.css")') || cjsContent.includes('require("./styles/index.css")')) {
    throw new Error('CSS import found in CJS build');
  }
  
  if (esmContent.includes('import "./index.css"') || esmContent.includes('import "./styles/index.css"')) {
    throw new Error('CSS import found in ESM build');
  }
  
  console.log('✅ No CSS import issues found');
  
  // Check key exports
  console.log('🔍 Checking key exports...');
  const requiredExports = [
    'CookieConsentProvider',
    'CookieConsentBanner',
    'CookieConsentModal', 
    'CookieConsentGate',
    'CookiePolicy',
    'DefaultTheme',
    'useCookieConsentContext',
    'useCookieState',
    'getLocalizedCookieText'
  ];
  
  const missingExports = requiredExports.filter(exportName => !cjsExports[exportName]);
  
  if (missingExports.length > 0) {
    throw new Error(`Missing exports: ${missingExports.join(', ')}`);
  }
  
  console.log('✅ All required exports are available');
  
  // Check type definitions
  console.log('📝 Checking type definitions...');
  const typeDefPath = path.join(__dirname, '../dist/index.d.ts');
  if (fs.existsSync(typeDefPath)) {
    const typeDefContent = fs.readFileSync(typeDefPath, 'utf8');
    if (typeDefContent.includes('export declare const CookieConsentProvider')) {
      console.log('✅ Type definitions include CookieConsentProvider');
    } else {
      console.log('⚠️  Type definitions may be incomplete');
    }
  } else {
    throw new Error('Type definitions not found');
  }
  
  console.log('\n🎉 All import tests passed!');
  console.log('📊 Package exports found:', Object.keys(cjsExports).length);
  console.log('📋 Available exports:', Object.keys(cjsExports).join(', '));
  
} catch (error) {
  console.error('\n❌ Import test failed:', error.message);
  process.exit(1);
}

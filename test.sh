#!/bin/bash
# Interactive test script for the OpenCode plugin generator
# This script demonstrates how to manually test the generator

set -e

echo "=========================================="
echo "OpenCode Plugin Generator - Test Script"
echo "=========================================="
echo ""

# Create a temporary test directory
TEST_DIR=$(mktemp -d)
echo "📁 Test directory: $TEST_DIR"
cd "$TEST_DIR"

# Clone the template
echo "📥 Cloning template..."
git clone https://github.com/zenobi-us/opencode-plugin-template.git test-plugin
cd test-plugin

echo ""
echo "=========================================="
echo "Running Generator"
echo "=========================================="
echo ""
echo "When prompted, enter the following values:"
echo "  Plugin name: my-test-plugin"
echo "  Description: A test plugin"
echo "  Author name: Test User"
echo "  Author email: test@user.com"
echo "  Repository URL: https://github.com/test/my-test-plugin"
echo "  GitHub org: test"
echo ""
echo "Running: bunx plop --plopfile ./plopfile.js"
echo ""

# Run the generator
bunx plop --plopfile ./plopfile.js

echo ""
echo "=========================================="
echo "Generator Completed - Running Verification"
echo "=========================================="
echo ""

# Verification
ERRORS=0

# Check files exist
echo "✓ Checking generated files..."
if [ ! -f package.json ]; then
  echo "  ✗ FAIL: package.json not found"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ package.json exists"
fi

if [ ! -f README.md ]; then
  echo "  ✗ FAIL: README.md not found"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ README.md exists"
fi

if [ ! -d src ]; then
  echo "  ✗ FAIL: src/ directory not found"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ src/ directory exists"
fi

# Check generator cleanup
echo ""
echo "✓ Checking generator cleanup..."
if [ -d template ]; then
  echo "  ✗ FAIL: template/ directory still exists"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ template/ removed"
fi

if [ -f plopfile.js ]; then
  echo "  ✗ FAIL: plopfile.js still exists"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ plopfile.js removed"
fi

# Check git
echo ""
echo "✓ Checking git repository..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "  ✗ FAIL: Not on main branch (on: $CURRENT_BRANCH)"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ On main branch"
fi

COMMIT_COUNT=$(git rev-list --count HEAD)
if [ "$COMMIT_COUNT" -lt 1 ]; then
  echo "  ✗ FAIL: No commits found"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ Initial commit exists"
  echo "    Commits: $COMMIT_COUNT"
fi

# Check package.json values
echo ""
echo "✓ Checking package.json templating..."
PKG_NAME=$(jq -r '.name' package.json)
if [ "$PKG_NAME" != "my-test-plugin" ]; then
  echo "  ✗ FAIL: package.json name mismatch (got: $PKG_NAME)"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ name: $PKG_NAME"
fi

PKG_DESC=$(jq -r '.description' package.json)
if [ "$PKG_DESC" != "A test plugin" ]; then
  echo "  ✗ FAIL: description mismatch (got: $PKG_DESC)"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ description: $PKG_DESC"
fi

PKG_AUTHOR=$(jq -r '.author.name' package.json)
if [ "$PKG_AUTHOR" != "Test User" ]; then
  echo "  ✗ FAIL: author name mismatch (got: $PKG_AUTHOR)"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ author.name: $PKG_AUTHOR"
fi

# Check README templating
echo ""
echo "✓ Checking README.md templating..."
if grep -q "my-test-plugin" README.md; then
  echo "  ✓ Plugin name found in README"
else
  echo "  ✗ FAIL: Plugin name not found in README"
  ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
  echo "✅ ALL TESTS PASSED"
  echo "=========================================="
  echo ""
  echo "Test directory: $TEST_DIR"
  echo ""
  echo "Next steps:"
  echo "  cd $TEST_DIR/test-plugin"
  echo "  bun install"
  echo "  mise run build"
  echo "  mise run lint"
  exit 0
else
  echo "❌ $ERRORS TEST(S) FAILED"
  echo "=========================================="
  echo ""
  echo "Test directory: $TEST_DIR"
  exit 1
fi

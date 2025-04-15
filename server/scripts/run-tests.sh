#!/bin/bash

# Ensure we're in the server directory
cd "$(dirname "$0")/.."

# Run the tests
npm test -- "$@"

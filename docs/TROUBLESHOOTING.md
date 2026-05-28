# Troubleshooting

## Packaging and Build Failures

**Missing Icons**
Error: `Missing build/icon.ico` or `Missing build/icon.icns`
Solution: Run `npm run generate:icon` to rebuild the placeholders.

**SafeStorage Unavailable**
Error: `macOS secure storage is unavailable` or `Windows secure storage is unavailable`.
Solution: The app refuses to store the API key in plaintext. Ensure your OS key manager (DPAPI or Keychain) is functioning. For macOS, this may fail if you are running in a headless CI runner without a keychain unlocked.

## OS Security Warnings

**macOS Gatekeeper**
Error: "Venice Forge cannot be opened because the developer cannot be verified."
Solution: For local builds only, you can strip the quarantine flag:
```bash
xattr -dr com.apple.quarantine "/Applications/Venice Forge.app"
```

**Windows SmartScreen**
Error: "Windows protected your PC."
Solution: Click "More info" and then "Run anyway" for locally built unsigned binaries.

## Runtime Issues

**Invalid Venice Key / Rate Limits**
Check the **Status** tab for the latest sanitized API error. If you receive continuous 400 or 401 errors, your key is likely expired or malformed.
Logs are available at:
- **Windows**: `%APPDATA%\Venice Forge\logs\venice-forge.log`
- **macOS**: `~/Library/Application Support/Venice Forge/logs/venice-forge.log`

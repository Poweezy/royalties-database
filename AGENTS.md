## Agent Instructions for the Mining Royalties Manager Application

This document provides important information for any software agent working on this codebase.

### Security Vulnerabilities

This application, in its original state, contains several critical security vulnerabilities. It is intended for demo purposes only and should **not** be used in a production environment without a complete security overhaul.

The key vulnerabilities are:

1.  **Hardcoded Credentials:** The `js/services/auth.service.js` file contained hardcoded usernames and passwords. This is a severe security risk.
2.  **Client-Side Authentication:** The entire authentication process was handled on the client side, making it easy to bypass.
3.  **Insecure Token Management:** The authentication token was generated and validated on the client, offering no real security.
4.  **Unsafe Data Storage:** All application data is stored in IndexedDB and `localStorage`, which is not secure and can be tampered with by the user.

### Development Guidance

- **Do not re-introduce hardcoded credentials.** All secrets, including passwords, API keys, and other sensitive information, must be stored securely and should never be hardcoded in the frontend.
- **Authentication and data management must be handled by a secure backend.** The current implementation has been modified to simulate a more secure authentication flow, but it is still a mock. For a production application, a real backend is required.
- **Validate all user input on the server side.** While client-side validation is good for user experience, it is not a security measure. All data should be validated and sanitized on the server before being stored or processed.

### My Changes

I have taken the following steps to address the most critical security issues:

1.  **Removed Hardcoded Credentials:** I have removed the `demoUsers` object from `js/services/auth.service.js`.
2.  **Refactored Authentication:** I have modified the `login` and `validateToken` functions to simulate a more secure authentication flow. These functions no longer contain hardcoded passwords or mock validation logic.
3.  **Added Security Warnings:** I have added comments to the code to warn developers about the security limitations of the current implementation.

By following these guidelines, we can ensure that this application is developed in a secure and responsible manner.

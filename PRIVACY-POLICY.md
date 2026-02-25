Privacy Policy for De-Saff
==========================

**Last Updated:** February 25, 2026

This Privacy Policy explains the practices regarding the collection, use, and disclosure of information when you use the
De-Saff Chrome Extension ("the Extension").

Our core privacy principle is simple: **We do not collect, transmit, or store your personal data.** ## 1. Information We
Do Not Collect De-Saff is designed to operate entirely locally within your browser.

- **No Telemetry:** We do not use analytics software to track your usage.

- **No Ticket Data:** We do not read, log, or transmit the contents of any HelpSpot tickets, emails, attachments, or
  status updates.

- **No Personal Information:** We do not collect names, email addresses, or any identifiable user data.

2\. Local Data Storage
----------------------

To function, the Extension must remember your configuration choices (e.g., which users to hide, whether to run
automatically on page load, and your toggle states).

- All preferences are saved exclusively to your local machine using Chrome's native `chrome.storage.local` API.

- This data **never** leaves your device and is never transmitted to any external developers or third-party servers.

- You can clear this data at any time by uninstalling the extension or clearing your browser's local extension storage.

3\. Extension Permissions
-------------------------

De-Saff requires certain permissions to modify the HelpSpot interface. Here is exactly why we request them:

- **`storage`**: Used solely to save and retrieve your local UI settings.

- **`activeTab`** / Host Permissions: Used strictly to identify when you are on a HelpSpot page so the script can inject
  the "Hide/Show" toggle buttons and organize the ticket stream.

- **`scripting`**: Used to inject the required DOM-manipulation scripts into the HelpSpot page.

- **`contextMenus`**: Used to provide a right-click shortcut on the extension icon to quickly access your settings.

4\. Third-Party Services
------------------------

De-Saff does not integrate with any third-party APIs, advertising networks, or tracking services. It is a standalone,
client-side tool.

5\. Changes to This Privacy Policy
----------------------------------

We may update our Privacy Policy from time to time if the Extension requires new local permissions. We will notify you
of any changes by updating the "Last Updated" date at the top of this policy.

6\. Contact Us
--------------

If you have any questions or suggestions about this Privacy Policy, please reach out via the extension's support page on
the Chrome Web Store.

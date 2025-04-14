# Markdown to HTML VSCode Extension

A dead simple extension for VSCode that allows converting Markdown to HTML using [markdown-it](https://github.com/markdown-it/markdown-it).

## Features

- **Convert on Demand:** Convert the currently open Markdown file to HTML using the command `Markdown to HTML: Convert to HTML`.
- **Save HTML:** Save the generated HTML to a file.
    - The output filename can be configured using the `outputFile` setting. Use `<filename>` as a placeholder for the original Markdown filename (without extension).
    - If the `outputFile` setting does *not* contain `<filename>`, that exact name will be used (e.g., `report.html`).
    - Defaults to `index.html` for untitled files.
    - For saved files, the HTML is saved in the same directory as the Markdown file.
- **Auto-Refresh on Save (Opt-in per file):**
    - Auto-refresh can be enabled or disabled on a per-file basis.
    - Once enabled for a file using `Markdown to HTML: Enable Auto-Refresh on Save`, saving that Markdown file will automatically regenerate the HTML output.
    - Use `Markdown to HTML: Disable Auto-Refresh on Save` to stop this behavior for the specific file.

## Commands

- `Markdown to HTML: Convert to HTML` (`markdown-to-html.convertToHtml`): Converts the active Markdown file to HTML based on the `outputFile` setting.
- `Markdown to HTML: Open in Browser` (`markdown-to-html.openInBrowser`): Converts the active Markdown file to HTML and then opens the generated file in your default browser.
- `Markdown to HTML: Enable Auto-Refresh on Save` (`markdown-to-html.enableAutoRefresh`): Enables automatic HTML regeneration whenever the current Markdown file is saved.
- `Markdown to HTML: Disable Auto-Refresh on Save` (`markdown-to-html.disableAutoRefresh`): Disables automatic HTML regeneration on save for the current Markdown file.

## Extension Settings

This extension contributes the following settings (found in VSCode Settings under Extensions > Markdown to HTML):

- `markdown-to-html.outputFile`: (string) The file path pattern to save the generated HTML to. Use `<filename>` as a placeholder for the original Markdown filename without the extension. If `<filename>` is not present, the string is used as the literal filename. Defaults to `index.html`.

## Live Reloading with Live Server

This extension focuses on converting Markdown to HTML. While the `Open in Browser` command opens the file, it won't automatically refresh an already open browser tab when the HTML changes.

For true live reloading (where the browser automatically refreshes the page when the HTML file is updated), we recommend using this extension in conjunction with a dedicated live server extension, such as [Live Server by Ritwick Dey](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).

**How to use them together:**

1.  Use this extension's `Convert to HTML` or `Enable Auto-Refresh on Save` command to generate your initial HTML file (e.g., `index.html`).
2.  Right-click the generated HTML file in the VS Code Explorer.
3.  Select "Open with Live Server" (or the equivalent command provided by your live server extension).
4.  Now, whenever this extension updates the HTML file (either manually via `Convert to HTML` or automatically via auto-refresh on save), the Live Server extension should detect the change and refresh your browser tab.

## Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ff6347/markdown-to-html-extension.git
    cd markdown-to-html-extension
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or: npm ci
    ```
3.  **Start the watchers (esbuild for bundling, tsc for type checking):**
    ```bash
    npm run watch
    ```
4.  **Open the project in VSCode:**
    ```bash
    code .
    ```
5.  **Run the extension:**
    - Press `F5` to open a new VSCode window with the extension loaded (Extension Development Host).
    - Open a Markdown file in the Extension Development Host window.
    - Open the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`) and run `Markdown: Convert to HTML`.
    - Try saving the file to see if it auto-refreshes.
    - Run `Markdown: Stop Auto-Refresh on Save` and save again to confirm it stopped.

## Testing

The extension comes with a test suite using the [`@vscode/test-cli`](https://github.com/microsoft/vscode-test-cli) framework and Mocha. The tests cover:

- Extension activation
- Markdown to HTML conversion
- Configuration handling

To run the tests:

1. Make sure you have all dependencies installed:
   ```bash
   npm ci
   ```

2. Run the tests:
   ```bash
   npm test
   ```

The test suite runs in a special instance of VS Code downloaded by the test runner and tests the extension in an environment similar to what users will experience.

## Publishing

1.  **Install `vsce` globally (if not already installed):**
    ```bash
    npm install -g @vscode/vsce
    ```

2.  **Package the extension:**
    ```bash
    vsce package
    ```

3.  **Test the VSIX locally:**
    - Open the Extensions view in VS Code.
    - Click on the "More" button (three vertical dots) next to the view title.
    - Select "Install from VSIX...".
    - Choose the `.vsix` file generated in the previous step.

4.  **Publish the extension to the VS Code Marketplace:**
    - Go to the [VS Code Marketplace](https://marketplace.visualstudio.com/manage/publishers/your-publisher-name) (replace `your-publisher-name` with your actual publisher ID).
    - Click on "New Extension" -> "Visual Studio Code".
    - Follow the instructions to upload the VSIX file.
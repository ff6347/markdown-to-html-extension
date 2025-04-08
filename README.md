# Markdown to HTML VSCode Extension

A dead simple extension for VSCode that allows converting Markdown to HTML using [markdown-it](https://github.com/markdown-it/markdown-it).

## Features

- Convert the currently open Markdown file to HTML using the command palette (`Markdown: Convert to HTML`).
- Save the generated HTML to a file (configurable path, defaults to `index.html` for untitled files, uses `<filename>` placeholder for saved files).
- Optionally open the generated HTML file in the default web browser.
- Optionally automatically convert and refresh the HTML output whenever the Markdown file is saved.

## Extension Settings

This extension contributes the following settings (found in VSCode Settings under Extensions > Markdown to HTML):

- `markdown-to-html.outputFile`: (string) The file path pattern to save the generated HTML to. Use `<filename>` as a placeholder for the original Markdown filename without the extension. Defaults to `index.html`.
- `markdown-to-html.openInBrowser`: (boolean) Whether to open the generated HTML in the default browser after conversion. Default: `true`
- `markdown-to-html.refreshOnSave`: (boolean) Whether to automatically convert and refresh the HTML when the Markdown file is saved. Default: `true`

## Development

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd markdown-to-html
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
    - Open the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`) and run `Markdown: Convert to HTML` (associated with the `markdown-to-html.convertToHtml` command ID).

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

3.  **Publish the extension:**
    - Open the Extensions view in VS Code.
    - Click on the "More" button (three vertical dots) next to the extension.
    - Select "Install from VSIX".
    - Choose the VSIX file generated in the previous step.

4.  **Publish the extension to the VS Code Marketplace:**
    - Go to the [VS Code Marketplace](https://marketplace.visualstudio.com/manage/publishers/your-publisher-name)
    - Click on "New Extension"
    - Follow the instructions to upload the VSIX file.
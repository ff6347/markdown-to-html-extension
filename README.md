# Markdown to HTML VSCode Extension

A dead simple extension for VSCode that allows converting Markdown to HTML using [markdown-it](https://github.com/markdown-it/markdown-it).

## Features

- Convert the currently open Markdown file to HTML using the command palette (`Markdown: Convert to HTML`).
- Save the generated HTML to a file (configurable path, defaults to `<filename>.html` next to the original Markdown file).
- Optionally open the generated HTML file in the default web browser.
- Optionally automatically convert and refresh the HTML output whenever the Markdown file is saved.

## Extension Settings

This extension contributes the following settings (found in VSCode Settings under Extensions > Markdown to HTML):

- `markdown-it.outputFile`: (string) The file path pattern to save the generated HTML to. Use `<filename>` as a placeholder for the original Markdown filename without the extension. Default: `"<filename>.html"`
- `markdown-it.openInBrowser`: (boolean) Whether to open the generated HTML in the default browser after conversion. Default: `true`
- `markdown-it.refreshOnSave`: (boolean) Whether to automatically convert and refresh the HTML when the Markdown file is saved. Default: `true`

## Development

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd markdown-to-html
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the TypeScript compiler in watch mode:**
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

## Testing

The extension comes with a test suite using the VS Code Extension Testing framework and Mocha. The tests cover:

- Extension activation
- Markdown to HTML conversion
- Configuration handling

To run the tests:

1. Make sure you have all dependencies installed:
   ```bash
   npm install
   ```

2. Run the tests:
   ```bash
   npm test
   ```

3. To get test coverage:
   ```bash
   npm run coverage
   ```

The test suite runs in a special instance of VS Code and tests the extension in an environment similar to what users will experience.

## Publishing

1.  **Install `vsce`
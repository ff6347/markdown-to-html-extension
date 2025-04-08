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
    - Open the command palette (`Cmd+Shift+P` or `Ctrl+Shift+P`) and run `Markdown: Convert to HTML`.

## Publishing

1.  **Install `vsce` (VS Code Extension Manager):**
    ```bash
    npm install -g @vscode/vsce
    ```
2.  **Get a Personal Access Token (PAT)** from Azure DevOps:
    - Go to [dev.azure.com/<your_organization>](https://dev.azure.com/<your_organization>)
    - User settings (top right icon) > Personal access tokens > New Token
    - Give it a name (e.g., `vscode-publisher`).
    - Set Organization to `All accessible organizations`.
    - Set Scopes to `Custom defined` > `Marketplace` > select `Manage`.
    - Click Create and copy the token somewhere safe.
3.  **Create a publisher:**
    - Go to the [VS Code Marketplace publisher management page](https://marketplace.visualstudio.com/manage/publishers/).
    - Log in with the same Microsoft account used for Azure DevOps.
    - Create a new publisher. Make sure the ID matches the `publisher` field in `package.json` (e.g., `your-publisher-name`).
4.  **Login with `vsce`:**
    ```bash
    vsce login <your-publisher-name>
    ```
    - Paste your PAT when prompted.
5.  **Update `package.json`:**
    - Change the `publisher` field to your actual publisher ID.
    - Increment the `version` number (e.g., `0.0.1` -> `0.1.0`).
6.  **Package the extension:**
    ```bash
    vsce package
    ```
    - This creates a `.vsix` file.
7.  **Publish the extension:**
    ```bash
    vsce publish
    ```

See the official [Publishing Extensions guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) for more details. 
---
title: "Testing Extensions"
source_url: "https://code.visualstudio.com/api/working-with-extensions/testing-extension"
word_count: 2015
reading_time: "11 min read"
date_converted: "2025-04-08T16:18:29.440Z"
---
# Testing Extensions

In this article

Visual Studio Code supports running and debugging tests for your extension. These tests will run inside a special instance of VS Code named the **Extension Development Host**, and have full access to the VS Code API. We refer to these tests as integration tests, because they go beyond unit tests that can run without a VS Code instance. This documentation focuses on VS Code integration tests.

[Overview](https://code.visualstudio.com/api/working-with-extensions/testing-extension#overview)
------------------------------------------------------------------------------------------------

If you are using the [Yeoman Generator](https://code.visualstudio.com/api/get-started/your-first-extension) to scaffold an extension, integration tests are already created for you.

In the generated extension, you can use `npm run test` or `yarn test` to run the integration tests that:

*   Downloads and unzips latest version of VS Code.
*   Runs the [Mocha](https://mochajs.org/) tests specified by the extension test runner script.

[Quick Setup: The test CLI](https://code.visualstudio.com/api/working-with-extensions/testing-extension#quick-setup-the-test-cli)
--------------------------------------------------------------------------------------------------------------------------------

The VS Code team publishes a command-line tool to run extension tests. You can find an example in the [extensions sample repo](https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-test-cli-sample).

The test CLI provides quick setup, and also allows you to easily run and debug tests of the VS Code UI using the [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner). The CLI exclusively uses [Mocha](https://mochajs.org/) under the hood.

To get started, you'll want to first install the `@vscode/test-cli` module, as well as `@vscode/test-electron` module that enables tests to be run in VS Code Desktop:

```
npm install --save-dev @vscode/test-cli @vscode/test-electron
```

After installing the modules, you'll have the `vscode-test` command line, which you can add to the `scripts` section in your `package.json`:

```
{
  "name": "my-cool-extension",
  "scripts": {
+   "test": "vscode-test"
```

`vscode-test` looks for a [`.vscode-test.js/mjs/cjs`](https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-test-cli-sample/.vscode-test.mjs) file relative to the current working directory. This file provides the configuration for the test runner, and you can find the entire definition [here](https://github.com/microsoft/vscode-test-cli/blob/main/src/config.cts).

Common options include:

*   **(required)** `files` - A pattern, list of patterns, or absolute paths containing the tests to run.
*   `version` - The version of VS Code to use for running tests (defaults to `stable`).
*   `workspaceFolder` - The path to a workspace to open during tests.
*   `extensionDevelopmentPath` - The path to your extension folder (defaults to the directory of the config file).
*   `mocha` - An object containing additional [options](https://mochajs.org/api/mocha#Mocha) to pass to Mocha.

The configuration might be as simple as:

```
// .vscode-test.js
const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({ files: 'out/test/**/*.test.js' });
```

...or more advanced:

```
// .vscode-test.js
const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig([
  {
    label: 'unitTests',
    files: 'out/test/**/*.test.js',
    version: 'insiders',
    workspaceFolder: './sampleWorkspace',
    mocha: {
      ui: 'tdd',
      timeout: 20000
    }
  }
  // you can specify additional test configurations, too
]);
```

If you define multiple configurations by passing an array, they'll be run sequentially when you run `vscode-test`. You can filter by the `label` and run them individually using the `--label` flag, for example `vscode-test --label unitTests`. Run `vscode-test --help` for the complete set of command-line options.

### [Test scripts](https://code.visualstudio.com/api/working-with-extensions/testing-extension#test-scripts)

Once the CLI is set up, you can write and run your tests. Test scripts have access to the VS Code API, and are run under Mocha. Here's a sample ([src/test/suite/extension.test.ts](https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-test-sample/src/test/suite/extension.test.ts)):

```
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
  suiteTeardown(() => {
    vscode.window.showInformationMessage('All tests done!');
  });

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
});
```

You can run this test with the `npm test` command, or by using the **Test: Run All Tests** command in VS Code after you install the [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner). You can also debug the test using **Test: Debug All Tests** command.

[Advanced setup: Your own runner](https://code.visualstudio.com/api/working-with-extensions/testing-extension#advanced-setup-your-own-runner)
--------------------------------------------------------------------------------------------------------------------------------

You can find the configuration for this guide in the [helloworld-test-sample](https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-test-sample). The rest of this document explains these files in the context of the sample:

*   The **test script** ([`src/test/runTest.ts`](https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-test-sample/src/test/runTest.ts))
*   The **test runner script** ([`src/test/suite/index.ts`](https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-test-sample/src/test/suite/index.ts))

VS Code provides two CLI parameters for running extension tests, `--extensionDevelopmentPath` and `--extensionTestsPath`.

For example:

```
# - Launches VS Code Extension Host
# - Loads the extension at <EXTENSION-ROOT-PATH>
# - Executes the test runner script at <TEST-RUNNER-SCRIPT-PATH>
code \
--extensionDevelopmentPath=<EXTENSION-ROOT-PATH> \
--extensionTestsPath=<TEST-RUNNER-SCRIPT-PATH>
```

The **test script** ([`src/test/runTest.ts`](https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-test-sample/src/test/runTest.ts)) uses the `@vscode/test-electron` API to simplify the process of downloading, unzipping, and launching VS Code with extension test parameters:

```
import * as path from 'path';

import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to the extension test runner script
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // Download VS Code, unzip it and run the integration test
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch (err) {
    console.error(err);
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
```

The `@vscode/test-electron` API also allows:

*   Launching VS Code with a specific workspace.
*   Downloading a different version of VS Code rather than the latest stable release.
*   Launching VS Code with additional CLI parameters.

You can find more API usage examples at [microsoft/vscode-test](https://github.com/microsoft/vscode-test).

### [The test runner script](https://code.visualstudio.com/api/working-with-extensions/testing-extension#the-test-runner-script)

When running the extension integration test, `--extensionTestsPath` points to the **test runner script** ([`src/test/suite/index.ts`](https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-test-sample/src/test/suite/index.ts)) that programmatically runs the test suite. Below is the [test runner script](https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-test-sample/src/test/suite/index.ts) of `helloworld-test-sample` that uses Mocha to run the test suite. You can use this as a starting point and customize your setup with [Mocha's API](https://mochajs.org/api/mocha). You can also replace Mocha with any other test framework that can be run programmatically.

```
import * as path from 'path';
import * as Mocha from 'mocha';
import { glob } from 'glob';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((c, e) => {
    glob('**/**.test.js', { cwd: testsRoot })
      .then(files => {
        // Add files to the test suite
        files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          // Run the mocha test
          mocha.run(failures => {
            if (failures > 0) {
              e(new Error(`${failures} tests failed.`));
            } else {
              c();
            }
          });
        } catch (err) {
          e(err);
        }
      })
      .catch(err => {
        return e(err);
      });
  });
}
```

Both the test runner script and the `*.test.js` files have access to the VS Code API.

Here is a sample test ([src/test/suite/extension.test.ts](https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-test-sample/src/test/suite/extension.test.ts)):

```
import * as assert from 'assert';
import { after } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
  after(() => {
    vscode.window.showInformationMessage('All tests done!');
  });

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
});
```

### [Debugging the tests](https://code.visualstudio.com/api/working-with-extensions/testing-extension#debugging-the-tests)

Debugging the tests is similar to debugging the extension.

Here is a sample `launch.json` debugger configuration:

```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "runtimeExecutable": "${execPath}",
      "args": [
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
      ],
      "outFiles": ["${workspaceFolder}/out/test/**/*.js"]
    }
  ]
}
```

[Tips](https://code.visualstudio.com/api/working-with-extensions/testing-extension#tips)
----------------------------------------------------------------------------------------

### [Using Insiders version for extension development](https://code.visualstudio.com/api/working-with-extensions/testing-extension#using-insiders-version-for-extension-development)

Because of VS Code's limitation, if you are using VS Code stable release and try to run the integration test **on CLI**, it will throw an error:

```
Running extension tests from the command line is currently only supported if no other instance of Code is running.
```

In general if you run extension tests from CLI, the version the tests run with cannot be running already. As a workaround, you can run the tests in VS Code Stable and use [VS Code Insiders](https://code.visualstudio.com/insiders/) for development. As long as you are not running the tests from CLI in VS Code Insiders but in VS Code Stable, this setup will work fine.

An alternative is to run the extension tests from the debug launch configuration from within VS Code itself. This has the additional advantage that you can even debug the tests.

### [Disabling other extensions while debugging](https://code.visualstudio.com/api/working-with-extensions/testing-extension#disabling-other-extensions-while-debugging)

When you debug an extension test in VS Code, VS Code uses the globally installed instance of VS Code and will load all installed extensions. You can add `--disable-extensions` configuration to the `launch.json` or the `launchArgs` option of `@vscode/test-electron`'s `runTests` API.

```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Extension Tests",
      "type": "extensionHost",
      "request": "launch",
      "runtimeExecutable": "${execPath}",
      "args": [
        "--disable-extensions",
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--extensionTestsPath=${workspaceFolder}/out/test/suite/index"
      ],
      "outFiles": ["${workspaceFolder}/out/test/**/*.js"]
    }
  ]
}
```

```
await runTests({
  extensionDevelopmentPath,
  extensionTestsPath,
  /**
   * A list of launch arguments passed to VS Code executable, in addition to `--extensionDevelopmentPath`
   * and `--extensionTestsPath` which are provided by `extensionDevelopmentPath` and `extensionTestsPath`
   * options.
   *
   * If the first argument is a path to a file/folder/workspace, the launched VS Code instance
   * will open it.
   *
   * See `code --help` for possible arguments.
   */
  launchArgs: ['--disable-extensions']
});
```

### [Custom setup with @vscode/test-electron](https://code.visualstudio.com/api/working-with-extensions/testing-extension#custom-setup-with-vscodetestelectron)

Sometimes you might want to run custom setups, such as running `code --install-extension` to install another extension before starting your test. `@vscode/test-electron` has a more granular API to accommodate that case:

```
import * as cp from 'child_process';
import * as path from 'path';
import {
  downloadAndUnzipVSCode,
  resolveCliArgsFromVSCodeExecutablePath,
  runTests
} from '@vscode/test-electron';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');
    const vscodeExecutablePath = await downloadAndUnzipVSCode('1.40.1');
    const [cliPath, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

    // Use cp.spawn / cp.exec for custom setup
    cp.spawnSync(
      cliPath,
      [...args, '--install-extension', '<EXTENSION-ID-OR-PATH-TO-VSIX>'],
      {
        encoding: 'utf-8',
        stdio: 'inherit'
      }
    );

    // Run the extension test
    await runTests({
      // Use the specified `code` executable
      vscodeExecutablePath,
      extensionDevelopmentPath,
      extensionTestsPath
    });
  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
```

[Next steps](https://code.visualstudio.com/api/working-with-extensions/testing-extension#next-steps)
----------------------------------------------------------------------------------------------------

*   [Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration) - Run your extension tests in a Continuous Integration service such as Azure DevOps.

04/03/2025

## Links

- [](https://www.microsoft.com/)
- [.vscode-test.js/mjs/cjs](https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-test-cli-sample/.vscode-test.mjs)
- [Activation Events](https://code.visualstudio.com/api/references/activation-events)
- [Activity Bar](https://code.visualstudio.com/api/ux-guidelines/activity-bar)
- [Advanced setup: Your own runner](https://code.visualstudio.com/api/working-with-extensions/testing-extension#advanced-setup-your-own-runner)
- [Advanced Topics](https://code.visualstudio.com/api/working-with-extensions/testing-extension#advanced-topics-articles)
- [agent mode](vscode://GitHub.Copilot-Chat/chat?mode=agent&referrer=vscode-agentbanner)
- [API](https://code.visualstudio.com/api)
- [Ask questions](https://stackoverflow.com/questions/tagged/vscode)
- [Blog](https://code.visualstudio.com/blogs)
- [Built-in Commands](https://code.visualstudio.com/api/references/commands)
- [Bundling Extensions](https://code.visualstudio.com/api/working-with-extensions/bundling-extension)
- [Chat](https://code.visualstudio.com/api/extension-guides/chat)
- [Chat Tutorial](https://code.visualstudio.com/api/extension-guides/chat-tutorial)
- [Color Theme](https://code.visualstudio.com/api/extension-guides/color-theme)
- [Command](https://code.visualstudio.com/api/extension-guides/command)
- [Command Palette](https://code.visualstudio.com/api/ux-guidelines/command-palette)
- [Common Capabilities](https://code.visualstudio.com/api/extension-capabilities/common-capabilities)
- [Context Menus](https://code.visualstudio.com/api/ux-guidelines/context-menus)
- [Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration)
- [Contribution Points](https://code.visualstudio.com/api/references/contribution-points)
- [Custom Data Extension](https://code.visualstudio.com/api/extension-guides/custom-data-extension)
- [Custom Editors](https://code.visualstudio.com/api/extension-guides/custom-editors)
- [Custom setup with @vscode/test-electron](https://code.visualstudio.com/api/working-with-extensions/testing-extension#custom-setup-with-vscodetestelectron)
- [Debugger Extension](https://code.visualstudio.com/api/extension-guides/debugger-extension)
- [Debugging the tests](https://code.visualstudio.com/api/working-with-extensions/testing-extension#debugging-the-tests)
- [Disabling other extensions while debugging](https://code.visualstudio.com/api/working-with-extensions/testing-extension#disabling-other-extensions-while-debugging)
- [Docs](https://code.visualstudio.com/docs)
- [Document Selector](https://code.visualstudio.com/api/references/document-selector)
- [Download](https://code.visualstudio.com/Download)
- [Edit](https://vscode.dev/github/microsoft/vscode-docs/blob/main/api/working-with-extensions/testing-extension.md)
- [Editor Actions](https://code.visualstudio.com/api/ux-guidelines/editor-actions)
- [Embedded Languages](https://code.visualstudio.com/api/language-extensions/embedded-languages)
- [Extending Workbench](https://code.visualstudio.com/api/extension-capabilities/extending-workbench)
- [Extension Anatomy](https://code.visualstudio.com/api/get-started/extension-anatomy)
- [Extension Capabilities](https://code.visualstudio.com/api/working-with-extensions/testing-extension#extension-capabilities-articles)
- [Extension Guides](https://code.visualstudio.com/api/working-with-extensions/testing-extension#extension-guides-articles)
- [Extension Host](https://code.visualstudio.com/api/advanced-topics/extension-host)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner)
- [Extensions](https://marketplace.visualstudio.com/VSCode)
- [extensions sample repo](https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-test-cli-sample)
- [FAQ](https://code.visualstudio.com/docs/supporting/faq)
- [File Icon Theme](https://code.visualstudio.com/api/extension-guides/file-icon-theme)
- [Follow @code](https://go.microsoft.com/fwlink/?LinkID=533687)
- [Get Started](https://code.visualstudio.com/api/working-with-extensions/testing-extension#get-started-articles)
- [GitHub Copilot](https://code.visualstudio.com/docs/copilot/overview)
- [helloworld-test-sample](https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-test-sample)
- [here](https://github.com/microsoft/vscode-test-cli/blob/main/src/config.cts)
- [Language Configuration Guide](https://code.visualstudio.com/api/language-extensions/language-configuration-guide)
- [Language Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension#language-extensions-articles)
- [Language Model](https://code.visualstudio.com/api/extension-guides/language-model)
- [Language Model Tools](https://code.visualstudio.com/api/extension-guides/tools)
- [Language Model Tutorial](https://code.visualstudio.com/api/extension-guides/language-model-tutorial)
- [Language Server Extension Guide](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide)
- [License](https://code.visualstudio.com/License)
- [Markdown Extension](https://code.visualstudio.com/api/extension-guides/markdown-extension)
- [microsoft/vscode-test](https://github.com/microsoft/vscode-test)
- [Migrate from TSLint to ESLint](https://code.visualstudio.com/api/advanced-topics/tslint-eslint-migration)
- [Mocha](https://mochajs.org/)
- [Mocha's API](https://mochajs.org/api/mocha)
- [Next steps](https://code.visualstudio.com/api/working-with-extensions/testing-extension#next-steps)
- [Notebook](https://code.visualstudio.com/api/extension-guides/notebook)
- [Notifications](https://code.visualstudio.com/api/ux-guidelines/notifications)
- [options](https://mochajs.org/api/mocha#Mocha)
- [Overview](https://code.visualstudio.com/api/working-with-extensions/testing-extension#overview)
- [Panel](https://code.visualstudio.com/api/ux-guidelines/panel)
- [Privacy](https://go.microsoft.com/fwlink/?LinkId=521839)
- [Product Icon Reference](https://code.visualstudio.com/api/references/icons-in-labels)
- [Product Icon Theme](https://code.visualstudio.com/api/extension-guides/product-icon-theme)
- [Programmatic Language Features](https://code.visualstudio.com/api/language-extensions/programmatic-language-features)
- [Prompt TSX](https://code.visualstudio.com/api/extension-guides/prompt-tsx)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Python Extension Template](https://code.visualstudio.com/api/advanced-topics/python-extension-template)
- [Quick Picks](https://code.visualstudio.com/api/ux-guidelines/quick-picks)
- [Quick Setup: The test CLI](https://code.visualstudio.com/api/working-with-extensions/testing-extension#quick-setup-the-test-cli)
- [References](https://code.visualstudio.com/api/working-with-extensions/testing-extension#references-articles)
- [Remote Development and Codespaces](https://code.visualstudio.com/api/advanced-topics/remote-extensions)
- [Report issues](https://www.github.com/Microsoft/vscode/issues)
- [Request features](https://go.microsoft.com/fwlink/?LinkID=533482)
- [RSS Feed](https://code.visualstudio.com/feed.xml)
- [Search](https://code.visualstudio.com/Search)
- [Semantic Highlight Guide](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide)
- [Settings](https://code.visualstudio.com/api/ux-guidelines/settings)
- [Sidebars](https://code.visualstudio.com/api/ux-guidelines/sidebars)
- [Snippet Guide](https://code.visualstudio.com/api/language-extensions/snippet-guide)
- [Source Control](https://code.visualstudio.com/api/extension-guides/scm-provider)
- [src/test/runTest.ts](https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-test-sample/src/test/runTest.ts)
- [src/test/suite/extension.test.ts](https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-test-sample/src/test/suite/extension.test.ts)
- [src/test/suite/index.ts](https://github.com/microsoft/vscode-extension-samples/blob/main/helloworld-test-sample/src/test/suite/index.ts)
- [Status Bar](https://code.visualstudio.com/api/ux-guidelines/status-bar)
- [Support](https://support.serviceshub.microsoft.com/supportforbusiness/create?sapId=d66407ed-3967-b000-4cfb-2c318cad363d)
- [Syntax Highlight Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
- [Task Provider](https://code.visualstudio.com/api/extension-guides/task-provider)
- [Telemetry](https://code.visualstudio.com/api/extension-guides/telemetry)
- [Terms of Use](https://www.microsoft.com/legal/terms-of-use)
- [Test Extension](https://code.visualstudio.com/api/extension-guides/testing)
- [Test scripts](https://code.visualstudio.com/api/working-with-extensions/testing-extension#test-scripts)
- [Testing and Publishing](https://code.visualstudio.com/api/working-with-extensions/testing-extension#working-with-extensions-articles)
- [Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [The test runner script](https://code.visualstudio.com/api/working-with-extensions/testing-extension#the-test-runner-script)
- [Theme Color](https://code.visualstudio.com/api/references/theme-color)
- [Theming](https://code.visualstudio.com/api/extension-capabilities/theming)
- [Tips](https://code.visualstudio.com/api/working-with-extensions/testing-extension#tips)
- [Tree View](https://code.visualstudio.com/api/extension-guides/tree-view)
- [Updates](https://code.visualstudio.com/updates)
- [Using Insiders version for extension development](https://code.visualstudio.com/api/working-with-extensions/testing-extension#using-insiders-version-for-extension-development)
- [Using Proposed API](https://code.visualstudio.com/api/advanced-topics/using-proposed-api)
- [UX Guidelines](https://code.visualstudio.com/api/working-with-extensions/testing-extension#ux-guidelines-articles)
- [Views](https://code.visualstudio.com/api/ux-guidelines/views)
- [Virtual Documents](https://code.visualstudio.com/api/extension-guides/virtual-documents)
- [Virtual Workspaces](https://code.visualstudio.com/api/extension-guides/virtual-workspaces)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code API](https://code.visualstudio.com/api/references/vscode-api)
- [VS Code Insiders](https://code.visualstudio.com/insiders/)
- [Walkthroughs](https://code.visualstudio.com/api/ux-guidelines/walkthroughs)
- [Watch videos](https://www.youtube.com/channel/UCs5Y5_7XK8HLDX0SLNwkd3w)
- [Web Extensions](https://code.visualstudio.com/api/extension-guides/web-extensions)
- [Webview](https://code.visualstudio.com/api/extension-guides/webview)
- [Webviews](https://code.visualstudio.com/api/ux-guidelines/webviews)
- [When clause contexts](https://code.visualstudio.com/api/references/when-clause-contexts)
- [Workspace Trust](https://code.visualstudio.com/api/extension-guides/workspace-trust)
- [Wrapping Up](https://code.visualstudio.com/api/get-started/wrapping-up)
- [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)

---
title: "Continuous Integration"
source_url: "https://code.visualstudio.com/api/working-with-extensions/continuous-integration#github-actions"
word_count: 1474
reading_time: "8 min read"
date_converted: "2025-04-08T16:31:02.852Z"
---
# Continuous Integration

In this article

Extension integration tests can be run on CI services. The [`@vscode/test-electron`](https://github.com/microsoft/vscode-test) library helps you set up extension tests on CI providers and contains a [sample extension](https://github.com/microsoft/vscode-test/tree/main/sample) setup on Azure Pipelines. You can check out the [build pipeline](https://dev.azure.com/vscode/vscode-test/_build?definitionId=15) or jump directly to the [`azure-pipelines.yml` file](https://github.com/microsoft/vscode-test/blob/main/sample/azure-pipelines.yml).

[Automated publishing](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#automated-publishing)
-----------------------------------------------------------------------------------------------------------------------------

You can also configure the CI to publish a new version of the extension automatically.

The publish command is similar to publishing from a local environment using [`vsce`](https://github.com/microsoft/vscode-vsce), but you must somehow provide the Personal Access Token (PAT) in a secure way. By storing the PAT as a `VSCE_PAT` **secret variable**, `vsce` will be able to use it. Secret variables are never exposed, so they are safe to use in a CI pipeline.

[Azure Pipelines](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#azure-pipelines)
-------------------------------------------------------------------------------------------------------------------

[![Image 1: Azure Pipelines](https://code.visualstudio.com/assets/api/working-with-extensions/continuous-integration/pipelines-logo.png)](https://azure.microsoft.com/services/devops/)

[Azure Pipelines](https://azure.microsoft.com/services/devops/pipelines/) is great for running VS Code extension tests as it supports running the tests on Windows, macOS, and Linux. For Open Source projects, you get unlimited minutes and 10 free parallel jobs. This section explains how to set up an Azure Pipelines for running your extension tests.

First, create a free account on [Azure DevOps](https://azure.microsoft.com/services/devops/) and create an [Azure DevOps project](https://azure.microsoft.com/features/devops-projects/) for your extension.

Then, add the following `azure-pipelines.yml` file to the root of your extension's repository. Other than the `xvfb` setup script for Linux that is necessary to run VS Code in headless Linux CI machines, the definition is straight-forward:

```
trigger:
  branches:
    include:
    - main
  tags:
    include:
    - v*

strategy:
  matrix:
    linux:
      imageName: 'ubuntu-latest'
    mac:
      imageName: 'macos-latest'
    windows:
      imageName: 'windows-latest'

pool:
  vmImage: $(imageName)

steps:

- task: NodeTool@0
  inputs:
    versionSpec: '10.x'
  displayName: 'Install Node.js'

- bash: |
    /usr/bin/Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
    echo ">>> Started xvfb"
  displayName: Start xvfb
  condition: and(succeeded(), eq(variables['Agent.OS'], 'Linux'))

- bash: |
    echo ">>> Compile vscode-test"
    yarn && yarn compile
    echo ">>> Compiled vscode-test"
    cd sample
    echo ">>> Run sample integration test"
    yarn && yarn compile && yarn test
  displayName: Run Tests
  env:
    DISPLAY: ':99.0'
```

Finally, [create a new pipeline](https://learn.microsoft.com/azure/devops/pipelines/create-first-pipeline) in your DevOps project and point it to the `azure-pipelines.yml` file. Trigger a build and voilà:

![Image 2: pipelines](https://code.visualstudio.com/assets/api/working-with-extensions/continuous-integration/pipelines.png)

You can enable the build to run continuously when pushing to a branch and even on pull requests. See [Build pipeline triggers](https://learn.microsoft.com/azure/devops/pipelines/build/triggers) to learn more.

### [Azure Pipelines automated publishing](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#azure-pipelines-automated-publishing)

1.  Set up `VSCE_PAT` as a secret variable using the [Azure DevOps secrets instructions](https://learn.microsoft.com/azure/devops/pipelines/process/variables?tabs=classic%2Cbatch#secret-variables).
2.  Install `vsce` as a `devDependencies` (`npm install @vscode/vsce --save-dev` or `yarn add @vscode/vsce --dev`).
3.  Declare a `deploy` script in `package.json` without the PAT (by default, `vsce` will use the `VSCE_PAT` environment variable as the Personal Access Token).

```
"scripts": {
  "deploy": "vsce publish --yarn"
}
```

4.  Configure the CI so the build will also run when tags are created:

```
trigger:
  branches:
    include:
    - main
  tags:
    include:
    - refs/tags/v*
```

5.  Add a `publish` step in `azure-pipelines.yml` that calls `yarn deploy` with the secret variable.

```
- bash: |
    echo ">>> Publish"
    yarn deploy
  displayName: Publish
  condition: and(succeeded(), startsWith(variables['Build.SourceBranch'], 'refs/tags/'), eq(variables['Agent.OS'], 'Linux'))
  env:
    VSCE_PAT: $(VSCE_PAT)
```

The [condition](https://learn.microsoft.com/azure/devops/pipelines/process/conditions) property tells the CI to run the publish step only in certain cases.

In our example, the condition has three checks:

*   `succeeded()` - Publish only if the tests pass.
*   `startsWith(variables['Build.SourceBranch'], 'refs/tags/')` - Publish only if a tagged (release) build.
*   `eq(variables['Agent.OS'], 'Linux')` - Include if your build runs on multiple agents (Windows, Linux, etc.). If not, remove that part of the condition.

Since `VSCE_PAT` is a secret variable, it is not immediately usable as an environment variable. Thus, we need to explicitly map the environment variable `VSCE_PAT` to the secret variable.

[GitHub Actions](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#github-actions)
-----------------------------------------------------------------------------------------------------------------

You can also configure GitHub Actions to run your extension CI. In headless Linux CI machines `xvfb` is required to run VS Code, so if Linux is the current OS run the tests in an Xvfb enabled environment:

```
on:
  push:
    branches:
      - main

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
    - name: Checkout
      uses: actions/checkout@v4
    - name: Install Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
    - run: npm install
    - run: xvfb-run -a npm test
      if: runner.os == 'Linux'
    - run: npm test
      if: runner.os != 'Linux'
```

### [GitHub Actions automated publishing](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#github-actions-automated-publishing)

1.  Set up `VSCE_PAT` as an encrypted secret using the [GitHub Actions secrets instructions](https://docs.github.com/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository).
2.  Install `vsce` as a `devDependencies` (`npm install @vscode/vsce --save-dev` or `yarn add @vscode/vsce --dev`).
3.  Declare a `deploy` script in `package.json` without the PAT.

```
"scripts": {
  "deploy": "vsce publish --yarn"
}
```

4.  Configure the CI so the build will also run when tags are created:

```
on:
  push:
    branches:
    - main
  release:
    types:
    - created
```

5.  Add a `publish` job to the pipeline that calls `npm run deploy` with the secret variable.

```
- name: Publish
  if: success() && startsWith(github.ref, 'refs/tags/') && matrix.os == 'ubuntu-latest'
  run: npm run deploy
  env:
    VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

The [if](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idif) property tells the CI to run the publish step only in certain cases.

In our example, the condition has three checks:

*   `success()` - Publish only if the tests pass.
*   `startsWith(github.ref, 'refs/tags/')` - Publish only if a tagged (release) build.
*   `matrix.os == 'ubuntu-latest'` - Include if your build runs on multiple agents (Windows, Linux, etc.). If not, remove that part of the condition.

[GitLab CI](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#gitlab-ci)
-------------------------------------------------------------------------------------------------------

GitLab CI can be used to test and publish the extension in headless Docker containers. This can be done by pulling a preconfigured Docker image, or installing `xvfb` and the libraries required to run Visual Studio Code during the pipeline.

```
image: node:12-buster

before_script:
  - npm install

test:
  script:
    - |
      apt update
      apt install -y libasound2 libgbm1 libgtk-3-0 libnss3 xvfb
      xvfb-run -a npm run test
```

### [GitLab CI automated publishing](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#gitlab-ci-automated-publishing)

1.  Set up `VSCE_PAT` as a masked variable using the [GitLab CI documentation](https://docs.gitlab.com/ee/ci/variables/README.html#mask-a-cicd-variable).
2.  Install `vsce` as a `devDependencies` (`npm install @vscode/vsce --save-dev` or `yarn add @vscode/vsce --dev`).
3.  Declare a `deploy` script in `package.json` without the PAT.

```
"scripts": {
  "deploy": "vsce publish --yarn"
}
```

4.  Add a `deploy` job that calls `npm run deploy` with the masked variable which will only trigger on tags.

```
deploy:
  only:
    - tags
  script:
    - npm run deploy
```

[Common questions](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#common-questions)
---------------------------------------------------------------------------------------------------------------------

### [Do I need to use Yarn for continuous integration?](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#do-i-need-to-use-yarn-for-continuous-integration)

All of the above examples refer to a hypothetical project built with [Yarn](https://yarnpkg.com/), but can be adapted to use [npm](https://www.npmjs.com/), [Grunt](https://gruntjs.com/), [Gulp](https://gulpjs.com/), or any other JavaScript build tool.

04/03/2025

## Links

- [](https://www.microsoft.com/)
- [@vscode/test-electron](https://github.com/microsoft/vscode-test)
- [Activation Events](https://code.visualstudio.com/api/references/activation-events)
- [Activity Bar](https://code.visualstudio.com/api/ux-guidelines/activity-bar)
- [Advanced Topics](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#advanced-topics-articles)
- [agent mode](vscode://GitHub.Copilot-Chat/chat?mode=agent&referrer=vscode-agentbanner)
- [API](https://code.visualstudio.com/api)
- [Ask questions](https://stackoverflow.com/questions/tagged/vscode)
- [Automated publishing](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#automated-publishing)
- [Azure DevOps project](https://azure.microsoft.com/features/devops-projects/)
- [Azure DevOps secrets instructions](https://learn.microsoft.com/azure/devops/pipelines/process/variables?tabs=classic%2Cbatch#secret-variables)
- [Azure Pipelines](https://azure.microsoft.com/services/devops/pipelines/)
- [Azure Pipelines automated publishing](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#azure-pipelines-automated-publishing)
- [azure-pipelines.yml file](https://github.com/microsoft/vscode-test/blob/main/sample/azure-pipelines.yml)
- [Blog](https://code.visualstudio.com/blogs)
- [build pipeline](https://dev.azure.com/vscode/vscode-test/_build?definitionId=15)
- [Build pipeline triggers](https://learn.microsoft.com/azure/devops/pipelines/build/triggers)
- [Built-in Commands](https://code.visualstudio.com/api/references/commands)
- [Bundling Extensions](https://code.visualstudio.com/api/working-with-extensions/bundling-extension)
- [Chat](https://code.visualstudio.com/api/extension-guides/chat)
- [Chat Tutorial](https://code.visualstudio.com/api/extension-guides/chat-tutorial)
- [Color Theme](https://code.visualstudio.com/api/extension-guides/color-theme)
- [Command](https://code.visualstudio.com/api/extension-guides/command)
- [Command Palette](https://code.visualstudio.com/api/ux-guidelines/command-palette)
- [Common Capabilities](https://code.visualstudio.com/api/extension-capabilities/common-capabilities)
- [Common questions](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#common-questions)
- [condition](https://learn.microsoft.com/azure/devops/pipelines/process/conditions)
- [Context Menus](https://code.visualstudio.com/api/ux-guidelines/context-menus)
- [Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration)
- [Contribution Points](https://code.visualstudio.com/api/references/contribution-points)
- [create a new pipeline](https://learn.microsoft.com/azure/devops/pipelines/create-first-pipeline)
- [Custom Data Extension](https://code.visualstudio.com/api/extension-guides/custom-data-extension)
- [Custom Editors](https://code.visualstudio.com/api/extension-guides/custom-editors)
- [Debugger Extension](https://code.visualstudio.com/api/extension-guides/debugger-extension)
- [Do I need to use Yarn for continuous integration?](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#do-i-need-to-use-yarn-for-continuous-integration)
- [Docs](https://code.visualstudio.com/docs)
- [Document Selector](https://code.visualstudio.com/api/references/document-selector)
- [Download](https://code.visualstudio.com/Download)
- [Edit](https://vscode.dev/github/microsoft/vscode-docs/blob/main/api/working-with-extensions/continuous-integration.md)
- [Editor Actions](https://code.visualstudio.com/api/ux-guidelines/editor-actions)
- [Embedded Languages](https://code.visualstudio.com/api/language-extensions/embedded-languages)
- [Extending Workbench](https://code.visualstudio.com/api/extension-capabilities/extending-workbench)
- [Extension Anatomy](https://code.visualstudio.com/api/get-started/extension-anatomy)
- [Extension Capabilities](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#extension-capabilities-articles)
- [Extension Guides](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#extension-guides-articles)
- [Extension Host](https://code.visualstudio.com/api/advanced-topics/extension-host)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Extensions](https://marketplace.visualstudio.com/VSCode)
- [FAQ](https://code.visualstudio.com/docs/supporting/faq)
- [File Icon Theme](https://code.visualstudio.com/api/extension-guides/file-icon-theme)
- [Follow @code](https://go.microsoft.com/fwlink/?LinkID=533687)
- [Get Started](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#get-started-articles)
- [GitHub Actions](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#github-actions)
- [GitHub Actions automated publishing](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#github-actions-automated-publishing)
- [GitHub Actions secrets instructions](https://docs.github.com/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository)
- [GitHub Copilot](https://code.visualstudio.com/docs/copilot/overview)
- [GitLab CI](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#gitlab-ci)
- [GitLab CI automated publishing](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#gitlab-ci-automated-publishing)
- [GitLab CI documentation](https://docs.gitlab.com/ee/ci/variables/README.html#mask-a-cicd-variable)
- [Grunt](https://gruntjs.com/)
- [Gulp](https://gulpjs.com/)
- [if](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idif)
- [Language Configuration Guide](https://code.visualstudio.com/api/language-extensions/language-configuration-guide)
- [Language Extensions](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#language-extensions-articles)
- [Language Model](https://code.visualstudio.com/api/extension-guides/language-model)
- [Language Model Tools](https://code.visualstudio.com/api/extension-guides/tools)
- [Language Model Tutorial](https://code.visualstudio.com/api/extension-guides/language-model-tutorial)
- [Language Server Extension Guide](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide)
- [License](https://code.visualstudio.com/License)
- [Markdown Extension](https://code.visualstudio.com/api/extension-guides/markdown-extension)
- [Migrate from TSLint to ESLint](https://code.visualstudio.com/api/advanced-topics/tslint-eslint-migration)
- [Notebook](https://code.visualstudio.com/api/extension-guides/notebook)
- [Notifications](https://code.visualstudio.com/api/ux-guidelines/notifications)
- [npm](https://www.npmjs.com/)
- [Overview](https://code.visualstudio.com/api/language-extensions/overview)
- [Panel](https://code.visualstudio.com/api/ux-guidelines/panel)
- [Privacy](https://go.microsoft.com/fwlink/?LinkId=521839)
- [Product Icon Reference](https://code.visualstudio.com/api/references/icons-in-labels)
- [Product Icon Theme](https://code.visualstudio.com/api/extension-guides/product-icon-theme)
- [Programmatic Language Features](https://code.visualstudio.com/api/language-extensions/programmatic-language-features)
- [Prompt TSX](https://code.visualstudio.com/api/extension-guides/prompt-tsx)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Python Extension Template](https://code.visualstudio.com/api/advanced-topics/python-extension-template)
- [Quick Picks](https://code.visualstudio.com/api/ux-guidelines/quick-picks)
- [References](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#references-articles)
- [Remote Development and Codespaces](https://code.visualstudio.com/api/advanced-topics/remote-extensions)
- [Report issues](https://www.github.com/Microsoft/vscode/issues)
- [Request features](https://go.microsoft.com/fwlink/?LinkID=533482)
- [RSS Feed](https://code.visualstudio.com/feed.xml)
- [sample extension](https://github.com/microsoft/vscode-test/tree/main/sample)
- [Search](https://code.visualstudio.com/Search)
- [Semantic Highlight Guide](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide)
- [Settings](https://code.visualstudio.com/api/ux-guidelines/settings)
- [Sidebars](https://code.visualstudio.com/api/ux-guidelines/sidebars)
- [Snippet Guide](https://code.visualstudio.com/api/language-extensions/snippet-guide)
- [Source Control](https://code.visualstudio.com/api/extension-guides/scm-provider)
- [Status Bar](https://code.visualstudio.com/api/ux-guidelines/status-bar)
- [Support](https://support.serviceshub.microsoft.com/supportforbusiness/create?sapId=d66407ed-3967-b000-4cfb-2c318cad363d)
- [Syntax Highlight Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
- [Task Provider](https://code.visualstudio.com/api/extension-guides/task-provider)
- [Telemetry](https://code.visualstudio.com/api/extension-guides/telemetry)
- [Terms of Use](https://www.microsoft.com/legal/terms-of-use)
- [Test Extension](https://code.visualstudio.com/api/extension-guides/testing)
- [Testing and Publishing](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#working-with-extensions-articles)
- [Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Theme Color](https://code.visualstudio.com/api/references/theme-color)
- [Theming](https://code.visualstudio.com/api/extension-capabilities/theming)
- [Tree View](https://code.visualstudio.com/api/extension-guides/tree-view)
- [Updates](https://code.visualstudio.com/updates)
- [Using Proposed API](https://code.visualstudio.com/api/advanced-topics/using-proposed-api)
- [UX Guidelines](https://code.visualstudio.com/api/working-with-extensions/continuous-integration#ux-guidelines-articles)
- [Views](https://code.visualstudio.com/api/ux-guidelines/views)
- [Virtual Documents](https://code.visualstudio.com/api/extension-guides/virtual-documents)
- [Virtual Workspaces](https://code.visualstudio.com/api/extension-guides/virtual-workspaces)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code API](https://code.visualstudio.com/api/references/vscode-api)
- [vsce](https://github.com/microsoft/vscode-vsce)
- [Walkthroughs](https://code.visualstudio.com/api/ux-guidelines/walkthroughs)
- [Watch videos](https://www.youtube.com/channel/UCs5Y5_7XK8HLDX0SLNwkd3w)
- [Web Extensions](https://code.visualstudio.com/api/extension-guides/web-extensions)
- [Webview](https://code.visualstudio.com/api/extension-guides/webview)
- [Webviews](https://code.visualstudio.com/api/ux-guidelines/webviews)
- [When clause contexts](https://code.visualstudio.com/api/references/when-clause-contexts)
- [Workspace Trust](https://code.visualstudio.com/api/extension-guides/workspace-trust)
- [Wrapping Up](https://code.visualstudio.com/api/get-started/wrapping-up)
- [Yarn](https://yarnpkg.com/)
- [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)

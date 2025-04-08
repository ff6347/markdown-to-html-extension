import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/extension.test.js', // Ensure this points to the single compiled test file
	workspaceFolder: './', // Add workspace folder configuration
});

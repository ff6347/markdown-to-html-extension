import * as path from 'path';
import {
	runTests,
	downloadAndUnzipVSCode,
	resolveCliArgsFromVSCodeExecutablePath,
} from '@vscode/test-electron';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Download VS Code with explicit platform/architecture for M1/M2 Macs
		const vscodeExecutablePath = await downloadAndUnzipVSCode(
			'stable',
			'darwin-arm64',
		);

		// Get CLI args for the platform
		const [cliPath, ...args] =
			resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

		// Run the integration test
		await runTests({
			vscodeExecutablePath,
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [
				...args,
				'--disable-extensions',
				'--disable-gpu',
				'--no-sandbox',
			],
		});
	} catch (err) {
		console.error('Failed to run tests:', err);
		process.exit(1);
	}
}

main();

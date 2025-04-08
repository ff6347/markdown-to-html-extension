import * as path from 'path';
import Mocha from 'mocha';
import glob = require('glob');

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
		color: true,
		timeout: 60000, // Timeout for each test
	});

	const testsRoot = path.resolve(__dirname, '.');

	return new Promise((resolve, reject) => {
		// Look for TypeScript test files
		glob(
			'**/*.test.ts',
			{ cwd: testsRoot },
			(err: Error | null, files: string[]) => {
				if (err) {
					return reject(err);
				}

				// Add files to the test suite
				files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

				try {
					// Run the mocha test
					mocha.run((failures: number) => {
						if (failures > 0) {
							reject(new Error(`${failures} tests failed.`));
						} else {
							resolve();
						}
					});
				} catch (err) {
					console.error(err);
					reject(err);
				}
			},
		);
	});
}

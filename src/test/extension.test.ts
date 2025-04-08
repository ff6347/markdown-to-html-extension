import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

suite('Extension Test Suite', () => {
	// Ensure extension is activated
	suiteSetup(async () => {
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
		await vscode.commands.executeCommand('markdown-to-html.convertToHtml');
	});

	test('Extension should be present and activated', async () => {
		const ext = vscode.extensions.getExtension('fmoronzirfas.markdown-to-html');
		assert.ok(ext, 'Extension should be available');
		if (!ext.isActive) {
			await ext.activate();
		}
		assert.ok(ext.isActive, 'Extension should be activated');
	});

	test('Should convert markdown to HTML', async function () {
		// Increase timeout for this test
		this.timeout(10000);

		// Create a temporary markdown file
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		assert.ok(workspaceFolder, 'No workspace folder found');

		const mdContent = '# Test Heading\n\nThis is a test paragraph.';
		const mdPath = path.join(workspaceFolder.uri.fsPath, 'test.md');
		const htmlPath = path.join(workspaceFolder.uri.fsPath, 'index.html');

		// Clean up any existing files
		if (fs.existsSync(htmlPath)) {
			fs.unlinkSync(htmlPath);
		}

		// Create the markdown file
		fs.writeFileSync(mdPath, mdContent);

		try {
			// Open the file in VS Code
			const doc = await vscode.workspace.openTextDocument(mdPath);
			await vscode.window.showTextDocument(doc);

			// Execute the command with the correct ID
			await vscode.commands.executeCommand('markdown-to-html.convertToHtml');

			// Wait a bit for the file to be created
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Check if HTML file exists
			assert.ok(fs.existsSync(htmlPath), 'HTML file was not created');

			// Read the HTML content
			const htmlContent = fs.readFileSync(htmlPath, 'utf8');

			// Basic checks on the HTML content
			assert.ok(
				htmlContent.includes('<!DOCTYPE html>'),
				'HTML should include doctype',
			);
			assert.ok(
				htmlContent.includes('<h1>Test Heading</h1>'),
				'HTML should include converted heading',
			);
			assert.ok(
				htmlContent.includes('<p>This is a test paragraph.</p>'),
				'HTML should include converted paragraph',
			);
		} finally {
			// Clean up
			if (fs.existsSync(mdPath)) {
				fs.unlinkSync(mdPath);
			}
			if (fs.existsSync(htmlPath)) {
				fs.unlinkSync(htmlPath);
			}
		}
	});

	test('Should respect configuration', async () => {
		const config = vscode.workspace.getConfiguration('markdown-to-html');
		assert.strictEqual(config.get('outputFile'), 'index.html');
		assert.strictEqual(config.get('openInBrowser'), true);
		assert.strictEqual(config.get('refreshOnSave'), true);
	});

	// Clean up after all tests
	suiteTeardown(async () => {
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});
});

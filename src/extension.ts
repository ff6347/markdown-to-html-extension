// works
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import markdownit from 'markdown-it';

async function convertMarkdownToHtml(document: vscode.TextDocument) {
	const config = vscode.workspace.getConfiguration('markdown-to-html');
	const outputFilePattern = config.get<string>('outputFile', 'index.html');
	const openInBrowser = config.get<boolean>('openInBrowser', true);

	// Ensure it's a Markdown file
	if (document.languageId !== 'markdown') {
		vscode.window.showWarningMessage('Please open a Markdown file first.');
		return;
	}

	const markdownText = document.getText();
	const md = new markdownit({
		html: true, // Enable HTML tags in source
		linkify: true, // Autoconvert URL-like text to links
		typographer: true, // Enable smart quotes and other typographic replacements
		// Add other markdown-it options or plugins here if needed
	});
	const htmlFragment = md.render(markdownText);

	// Wrap in HTML5 boilerplate
	const fileTitle = document.isUntitled
		? 'Untitled Document'
		: path.basename(document.uri.fsPath, path.extname(document.uri.fsPath));
	const htmlContent = /**html */ `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${fileTitle}</title>
	<style>
		/* Basic styles for readability */
		body {
			font-family: sans-serif;
			max-width: 800px;
			margin: 2em auto;
			padding: 0 1em;
			line-height: 1.6;
		}
		img { max-width: 100%; height: auto; }
		pre { background-color: #f4f4f4; padding: 1em; overflow-x: auto; }
		code { font-family: monospace; }
	</style>
</head>
<body>
	${htmlFragment}
</body>
</html>`;

	// Determine output path
	let outputFileName: string;
	let outputDir: string;

	if (document.isUntitled) {
		// For untitled files, use the configured pattern directly.
		// If it contains '<filename>', it won't be replaced, effectively using the pattern as is.
		// Since the default is now 'index.html', this works as intended.
		outputFileName = outputFilePattern; // Use the pattern (defaulting to index.html)

		// Output directory logic for untitled files (unchanged)
		if (
			vscode.workspace.workspaceFolders &&
			vscode.workspace.workspaceFolders.length > 0
		) {
			outputDir = vscode.workspace.workspaceFolders[0].uri.fsPath;
		} else {
			vscode.window.showWarningMessage(
				'Cannot determine output directory for untitled file. Saving to workspace root or current directory.',
			);
			outputDir = '.';
		}
	} else {
		// For saved files, replace '<filename>' in the pattern if present.
		const currentFilePath = document.uri.fsPath;
		const baseFileName = path.basename(
			currentFilePath,
			path.extname(currentFilePath),
		);
		// Replace <filename> if the pattern contains it
		if (outputFilePattern.includes('<filename>')) {
			outputFileName = outputFilePattern.replace('<filename>', baseFileName);
		} else {
			// If pattern doesn't contain <filename>, use it as is (e.g., a fixed name like "report.html")
			outputFileName = outputFilePattern;
		}
		// Output to the same directory as the source file
		outputDir = path.dirname(currentFilePath);
	}

	const outputFilePath = path.resolve(outputDir, outputFileName);

	try {
		await fs.promises.writeFile(outputFilePath, htmlContent, 'utf8');
		// Use status bar message with a timeout instead of persistent notification
		vscode.window.setStatusBarMessage(
			`Markdown converted to ${path.basename(outputFilePath)}`,
			10000,
		); // 10 seconds timeout

		if (openInBrowser) {
			const fileUri = vscode.Uri.file(outputFilePath);
			vscode.env.openExternal(fileUri);
		}
	} catch (err) {
		// Use unknown type assertion for error object
		vscode.window.showErrorMessage(
			`Failed to save or open HTML file: ${(err as Error).message}`,
		);
	}
}

export function activate(context: vscode.ExtensionContext) {
	// Keep track of files explicitly converted by the user command
	const explicitlyConvertedFiles = new Set<string>();

	// Command registration
	const convertCommandDisposable = vscode.commands.registerCommand(
		'markdown-to-html.convertToHtml',
		() => {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				convertMarkdownToHtml(editor.document);
			} else {
				vscode.window.showWarningMessage('No active Markdown editor found.');
			}
		},
	);

	context.subscriptions.push(convertCommandDisposable);
	// enable auto-refresh for the active file
	const enableAutoRefreshCommandDisposable = vscode.commands.registerCommand(
		'markdown-to-html.enableAutoRefresh',
		() => {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'markdown') {
				explicitlyConvertedFiles.add(editor.document.uri.fsPath);
				vscode.window.setStatusBarMessage(
					`Auto-refresh enabled for ${path.basename(
						editor.document.uri.fsPath,
					)}`,
					5000, // 5 seconds
				);
			} else {
				vscode.window.showWarningMessage('Please open a Markdown file first.');
			}
		},
	);

	context.subscriptions.push(enableAutoRefreshCommandDisposable);
	// Command to stop auto-refresh for the active file
	const disableAutoRefreshCommandDisposable = vscode.commands.registerCommand(
		'markdown-to-html.disableAutoRefresh',
		() => {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'markdown') {
				const filePath = editor.document.uri.fsPath;
				if (explicitlyConvertedFiles.has(filePath)) {
					explicitlyConvertedFiles.delete(filePath);
					vscode.window.setStatusBarMessage(
						`Stopped auto-refresh on save for ${path.basename(filePath)}`,
						5000, // 5 seconds
					);
				} else {
					vscode.window.showWarningMessage(
						'Auto-refresh was not active for this file.',
					);
				}
			} else {
				vscode.window.showWarningMessage(
					'Please have an active Markdown editor open.',
				);
			}
		},
	);
	context.subscriptions.push(disableAutoRefreshCommandDisposable);

	// Refresh on save listener
	const saveListenerDisposable = vscode.workspace.onDidSaveTextDocument(
		(document) => {
			const config = vscode.workspace.getConfiguration('markdown-to-html');
			if (
				config.get<boolean>('refreshOnSave', true) &&
				document.languageId === 'markdown'
			) {
				convertMarkdownToHtml(document);
			}
		},
	);

	context.subscriptions.push(saveListenerDisposable);
}

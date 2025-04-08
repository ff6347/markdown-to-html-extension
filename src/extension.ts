import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import markdownit from 'markdown-it';

async function convertMarkdownToHtml(document: vscode.TextDocument) {
	const config = vscode.workspace.getConfiguration('markdown-it');
	const outputFilePattern = config.get<string>('outputFile', '<filename>.html');
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
	const htmlContent = /**html */ `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${path.basename(
		document.uri.fsPath,
		path.extname(document.uri.fsPath),
	)}</title>
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
	const currentFilePath = document.uri.fsPath;
	const currentFileName = path.basename(
		currentFilePath,
		path.extname(currentFilePath),
	);
	const outputFileName = outputFilePattern.replace(
		'<filename>',
		currentFileName,
	);
	const outputFilePath = path.resolve(
		path.dirname(currentFilePath),
		outputFileName,
	);

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
		console.error('Error writing or opening HTML file:', err);
		// Use unknown type assertion for error object
		vscode.window.showErrorMessage(
			`Failed to save or open HTML file: ${(err as Error).message}`,
		);
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Markdown to HTML extension is now active!');

	// Command registration
	const convertCommandDisposable = vscode.commands.registerCommand(
		'markdown-it.convertToHtml',
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

	// Refresh on save listener
	const saveListenerDisposable = vscode.workspace.onDidSaveTextDocument(
		(document) => {
			const config = vscode.workspace.getConfiguration('markdown-it');
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

A dead simple extension for VSCode that allows to convert Markdown to HTML using markdown-it.

## Features

- Convert Markdown to HTML
- Save generated HTML to file
- Open generated HTML in browser
- Refresh HTML preview when file is saved
- Add html boilerplate to the generated HTML

```
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
</head>
<body>
	<!-- ADD MARKDOWN HERE -->

		<!-- ADD MARKDOWN HERE END -->
</body>
</html>
```

## Extension Settings

- `markdown-it.outputFile`: The file to save the generated HTML to. Default: `<filename>.html`
- `markdown-it.openInBrowser`: Whether to open the generated HTML in the browser. Default: `true`
- `markdown-it.refreshOnSave`: Whether to refresh the HTML preview when the file is saved. Default: `true`


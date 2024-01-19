// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "sequelizeextensionhelper" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('sequelizeextensionhelper.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from SequelizeExtensionHelper!');

	});

	let generateIndexFile = vscode.commands.registerCommand('sequelizeextensionhelper.generateIndex', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		
		const arrWorkspaceFolders = vscode.workspace.workspaceFolders;

		if (arrWorkspaceFolders && arrWorkspaceFolders.length > 0) {
			const workspaceFolder = arrWorkspaceFolders[0];
			const workspaceFolderPath = `${workspaceFolder.uri.path}/src`;
			console.log(workspaceFolderPath);
			const modelPath = await findModelFolder(workspaceFolderPath);
			const arrModels = await vscode.workspace.fs.readDirectory(vscode.Uri.parse(modelPath));
			console.log(arrModels);
		}

		vscode.window.showInformationMessage('Hello World from SequelizeExtensionHelper!');

	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(generateIndexFile);
}

const findModelFolder = async (workspaceFolderPath: string): Promise<string> => {
	const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.parse(workspaceFolderPath));
	
	for (const [name, type] of entries) {
		console.log(name, type);
		if (type === vscode.FileType.Directory && ['model','models'].includes(name.toLocaleLowerCase())) {
			return `${workspaceFolderPath}/${name}`;
		} else {
			if (type === vscode.FileType.File) {return '';}
		  const found = await findModelFolder(`${workspaceFolderPath}/${name}`);
			if (found) {
				return found;
			}
		}
	}

	return '';

};


// This method is called when your extension is deactivated
export function deactivate() {}

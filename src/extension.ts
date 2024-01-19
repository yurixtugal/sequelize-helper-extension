// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	

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
			
			const modelPath = await findModelFolder(workspaceFolderPath);
			const arrModels = await vscode.workspace.fs.readDirectory(vscode.Uri.parse(modelPath));
			
			let arrModelsContent = [];

			for (const [name] of arrModels) {
				if (['index.js', 'sequelize.js'].includes(name)) { continue; }
				const currentModelPath = `${modelPath}/${name}`;
				const uri = vscode.Uri.file(currentModelPath);
				const currentModel = await vscode.workspace.fs.readFile(uri);
				const currentModelContent = currentModel.toString();
				const arrModelContent = currentModelContent.split('\n');
				const modelExport = arrModelContent[arrModelContent.length - 1];
				const betweenBrackets = modelExport.substring(modelExport.indexOf('{') + 1, modelExport.indexOf('}'));
				const arrModels = betweenBrackets.split(',');
				arrModelsContent.push({
					model: arrModels[0].trim(),
					schema: arrModels[1].trim(),
					fileName: name,
				});
			}

			let indexImportContent = '';
			let initModelsContent = '';
			let associationsContent = '';

			for (const content of arrModelsContent) {
				indexImportContent += `const { ${content.model}, ${content.schema} } = require('./${content.fileName}');\n`;
				initModelsContent += `\t${content.model}.init(${content.schema}, ${content.model}.config(sequelize));\n`;
				associationsContent += `\t${content.model}.associate(sequelize.models);\n`;
			}

			let indexAllContent = `${indexImportContent}\nconst setUpModels = (sequelize) => {\n\n${initModelsContent}\n${associationsContent}\n}\n\nmodule.exports = { setUpModels };`;
			
			vscode.workspace.fs.writeFile(vscode.Uri.file(`${modelPath}/index.js`), Buffer.from(indexAllContent));

			vscode.window.showInformationMessage('Index file generated!');

		}

	});

	let generateSequelizeConnection = vscode.commands.registerCommand('sequelizeextensionhelper.generateConnection', async () => {
		const arrWorkspaceFolders = vscode.workspace.workspaceFolders;

		if (arrWorkspaceFolders && arrWorkspaceFolders.length > 0) {
			const workspaceFolder = arrWorkspaceFolders[0];
			const workspaceFolderPath = `${workspaceFolder.uri.path}/src`;
			
			const modelPath = await findModelFolder(workspaceFolderPath);		
		let content = 
`const { Sequelize } = require( 'sequelize')
const { setUpModels } = require( './index.js')
let sequelize = null
const initializeSequelize = async () => {
	try {

	const hostDB = process.env.HostDataBase;
	const userDB = process.env.UserDataBase;
	const passwordDB = process.env.PasswordDataBase;
	const nameDB = process.env.NameDataBase;
	if (!hostDB || !userDB || !passwordDB || !nameDB) {
		throw new Error('Missing environment variables');
	}
	if (!sequelize) {
		sequelize = new Sequelize(nameDB, userDB, passwordDB, {
			host: hostDB,
			dialect: 'mysql',
		});
		await sequelize.authenticate();
		setUpModels(sequelize);
	} else {
		sequelize.connectionManager.initPools();
		// eslint-disable-next-line no-prototype-builtins
		if (sequelize.connectionManager.hasOwnProperty('getConnection')) {
			delete sequelize.connectionManager.getConnection;
		}
	}

	return sequelize;
} catch (error) {
	console.error('Unable to connect to the database:', error);
	return null;
}
};

module.exports = { initializeSequelize };
`;
		
vscode.workspace.fs.writeFile(vscode.Uri.file(`${modelPath}/sequelize.js`), Buffer.from(content));

	}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(generateIndexFile);
	context.subscriptions.push(generateSequelizeConnection);
}

const findModelFolder = async (workspaceFolderPath: string): Promise<string> => {
	const entries = await vscode.workspace.fs.readDirectory(vscode.Uri.parse(workspaceFolderPath));
	
	for (const [name, type] of entries) {
		
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

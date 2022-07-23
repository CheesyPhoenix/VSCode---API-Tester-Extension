import * as vscode from "vscode";
import fetch from "node-fetch";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("api-tester.testAPI", async () => {
			const method = await vscode.window.showQuickPick(
				["GET", "POST", "PUT", "PATCH", "DELETE"],
				{
					title: "Select request method",
					placeHolder: "Select request method",
				}
			);
			if (!method) return;

			let url = await vscode.window.showInputBox({
				placeHolder: "Enter API URL",
				title: "Enter API URL",
			});
			if (!url) return;

			if (!url.startsWith("http")) url = "http://" + url;

			const res = await doRequest(method, url);

			if (!res) {
				vscode.window.showErrorMessage(
					"Internal error occured (this is a fault with this extension not your API)"
				);
				return;
			}

			let openResponse;

			if (res.status - 200 < 100) {
				openResponse = await vscode.window.showInformationMessage(
					"Your request retured a response with a status code of " +
						res.status,
					"View response body"
				);
			} else if (res.status - 300 < 100) {
				openResponse = await vscode.window.showWarningMessage(
					"Your request retured a response with a status code of " +
						res.status,
					"View response body"
				);
			} else {
				openResponse = await vscode.window.showErrorMessage(
					"Your request retured a response with a status code of " +
						res.status,
					"View response body"
				);
			}

			if (!openResponse) return;

			const document = await vscode.workspace.openTextDocument({
				content: res.data,
			});

			vscode.window.showTextDocument(document);
		})
	);
}

async function doRequest(method: string, url: string) {
	if (method === "GET") {
		return doFetch(url, method);
	} else {
		const body = await vscode.window.showInputBox({
			title: "Enter request body",
			placeHolder: "Enter request body",
			prompt: "Test",
		});

		return doFetch(url, method, body);
	}
}

async function doFetch(url: string, method: string, body?: string) {
	let res = await fetch(url, { method, body });

	return {
		status: res.status,
		data: await res.text(),
	};
}

// this method is called when your extension is deactivated
export function deactivate() {}

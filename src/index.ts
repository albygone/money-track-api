import * as Realm from 'realm-web';
import * as utils from './utils';

const dbUri =
	'mongodb+srv://albygone:legomania05@maincluster.lri6hlm.mongodb.net/?retryWrites=true&w=majority';

// The Worker's environment bindings. See `wrangler.toml` file.
interface Bindings {
	// MongoDB Realm Application ID
	REALM_APPID: string;
}

// Define type alias; available via `realm-web`
type Document = globalThis.Realm.Services.MongoDB.Document;

// Declare the interface for a "todos" document
interface Transaction extends Document {
	value: number;
	type: number;
	description: string;
	category: object;
}

let App: Realm.App;
const ObjectId = Realm.BSON.ObjectId;

// Define the Worker logic
const worker: ExportedHandler<Bindings> = {
	async fetch(req, env) {
		const url = new URL(req.url);
		App = App || new Realm.App(env.REALM_APPID);

		const method = req.method;
		const path = url.pathname.replace(/[/]$/, '');

		// Grab a reference to the "cloudflare.todos" collection
		// const collection = client
		// 	.db('moneytrack')
		// 	.collection<Transaction>('transactions');

		try {
			if (method === 'GET') {
			}

			// POST /api/todos
			if (method === 'POST') {
				if (path == '/emailpass/register') {
					let newUserCredentials: any = await req.json();

					await App.emailPasswordAuth.registerUser({
						email: newUserCredentials.email,
						password: newUserCredentials.password,
					});

					utils.reply('coap');

					const credentials = Realm.Credentials.emailPassword(
						newUserCredentials.email,
						newUserCredentials.password
					);

					let user = await App.logIn(credentials);

					return utils.reply(user.id);
				}

				if (path == '/emailpass/login') {
					let newUserCredentials: any = await req.json();

					const credentials = Realm.Credentials.emailPassword(
						newUserCredentials.email,
						newUserCredentials.password
					);

					let user = await App.logIn(credentials);

					return utils.reply(user.id);
				}

				if (path == '/getTransactions') {
					let data: any = await req.json();
					const id = data.id;

					const credentials = Realm.Credentials.apiKey(
						'drefwOtN17WPW2h42oCoxuj2Qq5xKmDpsgJxspfnPHMMVQbPntY0BkRLHWsnpq19'
					);

					var user = await App.logIn(credentials);
					var client = user.mongoClient('mongodb-atlas');

					const collection = client
						.db('moneytrack')
						.collection<Transaction>('transactions');

					return utils.reply(await collection.find({ user_id: id }));
				}
			}

			// unknown method
			return utils.toError('Method not allowed.', 405);
		} catch (err) {
			const msg = (err as Error).message || 'Error with query.';
			return utils.toError(msg, 500);
		}
	},
};

// Export for discoverability
export default worker;

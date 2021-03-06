import * as fs  from 'fs';
import * as readline  from 'readline';
const googleAuth = require('google-auth-library');

export class Gmail {

    private readonly SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

    // If modifying these scopes, delete your previously saved credentials
    // at ~/.credentials/gmail-nodejs-quickstart.json
    private TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
        process.env.USERPROFILE) + '.secret/client_secret';
    
    private TOKEN_PATH = this.TOKEN_DIR + 'gmail-nodejs-quickstart.json';

    constructor() {
        // Load client secrets from a local file.
        fs.readFile('.secret/client_secret.json',  (err, content) => {
            if (err) {
                console.log('Error loading client secret file: ' + err);
                return;
            }

            // Authorize a client with the loaded credentials, then call the
            // Gmail API.
            this.authorize(JSON.parse(content.toString()), this.listLabels);
        });
    }

    /**
     * Store token to disk be used in later program executions.
     *
     * @param {Object} token The token to store to disk.
     */
    storeToken(token) {
        try {
            fs.mkdirSync(this.TOKEN_DIR);
        } catch (err) {
            if (err.code != 'EEXIST') {
                throw err;
            }
        }
        fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), null);
        console.log('Token stored to ' + this.TOKEN_PATH);
    }     

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     *
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    authorize(credentials, callback) {
        console.log(credentials);
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        // Check if we have previously stored a token.
        fs.readFile(this.TOKEN_PATH,  (err, token) => {
            if (err) {
                this.getNewToken(oauth2Client, callback);
            } else {
                oauth2Client.credentials = JSON.parse(token.toString());
                callback(oauth2Client);
            }
        });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     *
     * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback to call with the authorized
     *     client.
     */
    getNewToken(oauth2Client, callback) {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES
        });
        console.log('Authorize this app by visiting this url: ', authUrl);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', (code) => { 
            rl.close();
            oauth2Client.getToken(code, (err, token) => {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    return;
                }
                oauth2Client.credentials = token;
                this.storeToken(token);
                callback(oauth2Client);
            });
        });
    }


    /**
     * Lists the labels in the user's account.
     *
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    listLabels(auth) {
        var gmail = google.gmail('v1');
        gmail.users.labels.list({
            auth: auth,
            userId: 'me',
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            var labels = response.labels;
            if (labels.length == 0) {
                console.log('No labels found.');
            } else {
                console.log('Labels:');
                for (var i = 0; i < labels.length; i++) {
                    var label = labels[i];
                    console.log('- %s', label.name);
                }
            }
        });
    }

    
}
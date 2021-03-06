import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env['GOOGLE_SERVICE_ACCOUNT']);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://room-finder-4d2b2.firebaseio.com'
});

export default admin;
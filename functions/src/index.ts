'use strict';

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

const corsHandler = cors({ origin: true });

admin.initializeApp(/* MUST ADD: service account */);

//@ts-ignore
import * as SpotifyWebApi from 'spotify-web-api-node';

const Spotify = new SpotifyWebApi({
  clientId: functions.config().spotify.client_id,
  clientSecret: functions.config().spotify.client_secret,
  redirectUri: `http://localhost:3000/`, // website url used in production
});

// Scopes to request.
const OAUTH_SCOPES = [
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'streaming',
];

/**
 * Redirects the User to the Spotify authentication consent screen. Also the 'state' cookie is set for later state
 * verification.
 */

export const redirect = functions.https.onRequest((req, res) => {
  // Parse the state from the query parameters
  const state = req.query.state as string;

  if (!state) {
    res.status(400).send('Missing state parameter');
    return;
  }

  functions.logger.log('Received state:', state);

  const authorizeURL = Spotify.createAuthorizeURL(OAUTH_SCOPES, state);

  res.redirect(authorizeURL);
});

/**
 * Exchanges a given Spotify auth code passed in the 'code' URL query parameter for a Firebase auth token.
 * The request also needs to specify a 'state' query parameter which will be checked against the 'state' cookie.
 * The Firebase custom auth token is sent back in a JSONP callback function with function name defined by the
 * 'callback' query parameter.
 */

export const token = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      functions.logger.log('Received state:', req.query.state);
      functions.logger.log('Received auth code:', req.query.code);

      if (!req.query.code || !req.query.state) {
        throw new Error('Missing code or state parameter');
      }

      let authData;
      try {
        authData = await Spotify.authorizationCodeGrant(
          req.query.code as string
        );
        functions.logger.log(
          'Received Access Token:',
          authData.body.access_token
        );
      } catch (error) {
        functions.logger.error('Error in authorizationCodeGrant:', error);
        throw error;
      }

      Spotify.setAccessToken(authData.body.access_token);

      let userResults;
      try {
        userResults = await Spotify.getMe();

        functions.logger.log(
          'Auth code exchange result received:',
          userResults.body.email
        );
        functions.logger.log(userResults.body.display_name);
      } catch (error) {
        functions.logger.error('Error in getMe:', error);
        throw error;
      }

      const spotifyUserID = userResults.body.id;
      const userName = userResults.body.display_name || '';
      const profilePic = `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(
        userName
      )}&size=250`;
      const email = userResults.body.email || '';

      console.log('is this user premium', userResults.body.type);

      const firebaseToken = await createFirebaseAccount(
        spotifyUserID,
        userName,
        profilePic,
        email,
        authData.body.access_token,
        userResults.body.type
      );

      res.json({ token: firebaseToken, state: req.query.state });
    } catch (error: any) {
      res.status(400).json({ error: error.toString() });
    }
  });
});

/**
 * Creates a Firebase account with the given user profile and returns a custom auth token allowing
 * signing-in this account.
 * Also saves the accessToken to the datastore at /spotifyAccessToken/$uid
 *
 * @returns {Promise<string>} The Firebase custom auth token in a promise.
 */
async function createFirebaseAccount(
  spotifyID: string,
  displayName: string,
  photoURL: string,
  email: string,
  accessToken: string,
  isPremium: string
): Promise<string> {
  const uid = `spotify:${spotifyID}`;

  const userProfile: any = {
    id: uid,
    service: 'spotify',
    isPremium,
    displayName,
    avatarUrl:
      photoURL ??
      `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(
        displayName
      )}&size=250`,
  };

  const databaseTask = admin
    .database()
    .ref(`/spotifyAccessToken/${uid}`)
    .set(accessToken);

  const firestoreTask = admin
    .firestore()
    .collection('users')
    .doc(uid)
    .set({ ...userProfile });

  const userCreationTask = admin
    .auth()
    .updateUser(uid, {
      displayName: displayName,
      photoURL:
        photoURL ??
        `https://eu.ui-avatars.com/api/?name=${displayName}&size=250`,
      email: email,
      emailVerified: true,
    })
    .catch((error: any) => {
      if (error.code === 'auth/user-not-found') {
        return admin.auth().createUser({
          uid: uid,
          displayName: displayName,
          photoURL:
            photoURL ??
            `https://eu.ui-avatars.com/api/?name=${displayName}&size=250`,
          email: email,
          emailVerified: true,
        });
      }
      throw error;
    });

  await Promise.all([userCreationTask, databaseTask, firestoreTask]);
  const token = await admin.auth().createCustomToken(uid);
  functions.logger.log(
    'Created Custom token for UID "',
    uid,
    '" Token:',
    token
  );
  return token;
}

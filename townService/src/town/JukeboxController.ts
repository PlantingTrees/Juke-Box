// src/controllers/JukeboxController.ts
import { request, Request, response, Response } from 'express';
import { Song } from '../types/CoveyTownSocket';
import { searchSpotifyTracks } from '../services/JukeboxService';
import { json } from 'stream/consumers';
import axios from 'axios';
import { error } from 'console';



const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
/** Controller for handling Spotify search requests */
export const spotifySearchController = async (req: Request, res: Response): Promise<Response> => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const searchResults = await searchSpotifyTracks(query as string);
    return res.json(searchResults);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch tracks from Spotify' });
  }
};

const generateRandomString = (length: number) => {
  // needed to prevent CORS attacks...Not that this project is going to go anywhere, yet.
  var randomString = '';
  var possibleCharacters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    randomString += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
  }
  return randomString;
}
export default class JukeboxController {
  localQueue: Song[];
  access_token: string;
  constructor() {
    this.localQueue = [];
    this.access_token = '';
  }

  // eslint-disable-next-line class-methods-use-this
  public isSongPlaying(): boolean {
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  public adjustVolume(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  }

  addToQueue(song: Song): void {
    this.localQueue.push(song);
  }

  public removeFromQueue(): void {
    this.localQueue.shift();
  }

  static voteToSkip(): void {}
  
  public handleLogin(req: any, res: any){
    console.log(req);
    // required for accessing web player sdk
    const scope = 'streaming user-read-email user-read-private';
    let state = generateRandomString(16);
    let auth_query_options = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID || '',
      scope: scope,
      redirect_uri: 'http://localhost:3000/auth/callback', // this will be accessed in the 'req' of callback function... take heed
      state: state
    })
    // makes a requests to authorize endpoint appending these options, this is the first step in spotify shitty authentication flow...
    // once approved by spotify authorized endpoint we get redirected to the redirect uri...
    res.redirect('https://accounts.spotify.com/authorize?' + auth_query_options.toString());
  }
  public handleCallback(req: any, res: any) {
    let code = req.query.code;

    let auth_options = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: 'http://localhost:3000/auth/callback', // for validation only, we've already gotten the auth code...
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization' : 'Basic ' + (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
        'Content-Type'  :  'application/x-www-form-urlencoded'
      },
      json: true
    };

    axios.post(auth_options.url, auth_options.form, {headers: auth_options.headers})
      .then(response => {
        if (response.status === 200) {
          this.access_token = response.data.access_token;
          res.redirect('/');
        }
      })
      .catch(error => {
        console.log('Error during authentication: ', error.message);
        res.status(500).send('Authentication failed!');
      });
    
  }

  public getToken(req: any, res: any) {
    console.log(req);
    res.json(
      {
        access_token: this.access_token
      }
    )
  }
}

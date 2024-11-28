import axios from 'axios';
import { Request, Response } from 'express';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:8081/auth/callback'; // Adjust this to your actual redirect URI

// Spotify token URL
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

// Function to exchange the authorization code for an access token
export async function exchangeCodeForAccessToken(code: string, state: string): Promise<string> {
  // Validate the state parameter to prevent CSRF
  if (state !== 'expectedState') {
    throw new Error('State does not match! Potential CSRF attack');
  }

  try {
    // Make the POST request to exchange the code for an access token
    const response = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code', // Exchange authorization code for token
        code: code, // The code received in the callback
        redirect_uri: REDIRECT_URI, // Redirect URI
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );

    // Access token will be in the response body
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token; // Optional: use refresh token for long-lived sessions

    return accessToken; // Return the access token to the caller
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw new Error('Failed to exchange code for access token');
  }
}

// Handle the callback route after the user approves the request
export async function handleSpotifyCallback(req: Request, res: Response): Promise<void> {
  const { code, state } = req.query;

  if (!code || !state) {
    res.status(400).send('Code or state missing in query parameters');
    return;
  }

  try {
    const accessToken = await exchangeCodeForAccessToken(code as string, state as string);
    console.log('got the accesssToken...', accessToken);
    res.json({ access_token: accessToken }); // Send the access token back to the frontend or use it as needed
  } catch (error) {
    res.status(500).send('Failed to exchange authorization code for token');
  }
}
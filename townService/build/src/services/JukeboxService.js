import axios from 'axios';
const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/api/token';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
let accessToken = '';
export async function getSpotifyAccessToken() {
    try {
        const response = await axios.post(SPOTIFY_AUTH_URL, new URLSearchParams({ grant_type: 'client_credentials' }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
            },
        });
        accessToken = response.data.access_token;
    }
    catch (error) {
        throw new Error('Token fetch failed');
    }
}
export async function searchSpotifyTracks(query) {
    if (!accessToken) {
        await getSpotifyAccessToken();
    }
    try {
        const response = await axios.get(`${SPOTIFY_BASE_URL}/search`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                q: query,
                type: 'track',
                limit: 10,
            },
        });
        return response.data.tracks.items.map((track) => ({
            songName: track.name,
            songDurationSec: track.duration_ms,
            albumName: track.album.name,
            artistName: track.artists[0].name,
            artworkUrl: track.album.images[0]?.url || '',
            trackUri: track.uri,
        }));
    }
    catch (error) {
        throw new Error('Failed to fetch tracks from Spotify');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSnVrZWJveFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2VydmljZXMvSnVrZWJveFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRzFCLE1BQU0sZ0JBQWdCLEdBQUcsNEJBQTRCLENBQUM7QUFDdEQsTUFBTSxnQkFBZ0IsR0FBRyx3Q0FBd0MsQ0FBQztBQUNsRSxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDO0FBQ2hELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUM7QUFDeEQsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO0FBRXJCLE1BQU0sQ0FBQyxLQUFLLFVBQVUscUJBQXFCO0lBQ3pDLElBQUk7UUFDRixNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQy9CLGdCQUFnQixFQUNoQixJQUFJLGVBQWUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxDQUFDLEVBQ3pEO1lBQ0UsT0FBTyxFQUFFO2dCQUNQLGNBQWMsRUFBRSxtQ0FBbUM7Z0JBQ25ELGVBQWUsRUFBRSxTQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLElBQUksYUFBYSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQzdFLFFBQVEsQ0FDVCxFQUFFO2FBQ0o7U0FDRixDQUNGLENBQUM7UUFDRixXQUFXLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7S0FDMUM7SUFBQyxPQUFPLEtBQUssRUFBRTtRQUNkLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztLQUN2QztBQUNILENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLG1CQUFtQixDQUFDLEtBQWE7SUFDckQsSUFBSSxDQUFDLFdBQVcsRUFBRTtRQUNoQixNQUFNLHFCQUFxQixFQUFFLENBQUM7S0FDL0I7SUFDRCxJQUFJO1FBQ0YsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsZ0JBQWdCLFNBQVMsRUFBRTtZQUM3RCxPQUFPLEVBQUU7Z0JBQ1AsYUFBYSxFQUFFLFVBQVUsV0FBVyxFQUFFO2FBQ3ZDO1lBQ0QsTUFBTSxFQUFFO2dCQUNOLENBQUMsRUFBRSxLQUFLO2dCQUNSLElBQUksRUFBRSxPQUFPO2dCQUNiLEtBQUssRUFBRSxFQUFFO2FBQ1Y7U0FDRixDQUFDLENBQUM7UUFFSCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzlELFFBQVEsRUFBRSxLQUFLLENBQUMsSUFBSTtZQUNwQixlQUFlLEVBQUUsS0FBSyxDQUFDLFdBQVc7WUFDbEMsU0FBUyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSTtZQUMzQixVQUFVLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ2pDLFVBQVUsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRTtZQUM1QyxRQUFRLEVBQUUsS0FBSyxDQUFDLEdBQUc7U0FDcEIsQ0FBQyxDQUFDLENBQUM7S0FDTDtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0tBQ3hEO0FBQ0gsQ0FBQyJ9
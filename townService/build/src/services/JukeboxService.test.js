import axios from 'axios';
jest.mock('axios');
const mockedAxios = axios;
describe('Jukebox Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('getSpotifyAccessToken', () => {
        it('fetches and sets the access token', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: { access_token: 'test_access_token' },
            });
            const { getSpotifyAccessToken } = await import('./JukeboxService');
            await getSpotifyAccessToken();
            expect(mockedAxios.post).toHaveBeenCalledWith('https://accounts.spotify.com/api/token', new URLSearchParams({ grant_type: 'client_credentials' }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                },
            });
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });
        it('handles errors when fetching the access token', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Token fetch failed'));
            const { getSpotifyAccessToken } = await import('./JukeboxService');
            await expect(getSpotifyAccessToken()).rejects.toThrow('Token fetch failed');
            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        });
    });
    describe('searchSpotifyTracks', () => {
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSnVrZWJveFNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9KdWtlYm94U2VydmljZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUcxQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25CLE1BQU0sV0FBVyxHQUFHLEtBQWtDLENBQUM7QUFFdkQsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtJQUMvQixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ2QsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtRQUNyQyxFQUFFLENBQUMsbUNBQW1DLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDakQsV0FBVyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztnQkFDckMsSUFBSSxFQUFFLEVBQUUsWUFBWSxFQUFFLG1CQUFtQixFQUFFO2FBQzVDLENBQUMsQ0FBQztZQUVILE1BQU0sRUFBRSxxQkFBcUIsRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDbkUsTUFBTSxxQkFBcUIsRUFBRSxDQUFDO1lBRTlCLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsb0JBQW9CLENBQzNDLHdDQUF3QyxFQUN4QyxJQUFJLGVBQWUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxDQUFDLEVBQ3pEO2dCQUNFLE9BQU8sRUFBRTtvQkFDUCxjQUFjLEVBQUUsbUNBQW1DO29CQUNuRCxlQUFlLEVBQUUsU0FBUyxNQUFNLENBQUMsSUFBSSxDQUNuQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxDQUN4RSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtpQkFDdkI7YUFDRixDQUNGLENBQUM7WUFDRixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLCtDQUErQyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzdELFdBQVcsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBRXhFLE1BQU0sRUFBRSxxQkFBcUIsRUFBRSxHQUFHLE1BQU0sTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDbkUsTUFBTSxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUU1RSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO0lBRXJDLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMifQ==
import useSpotifyPlayer from '../../../../hooks/useSpotifyPlayer';

interface JukeboxPlayerProps {
  token: string; // Spotify OAuth token from backend
  trackUri: string | null; // URI of the current track to play
  onSongEnd: () => void; // Callback when a song ends
}

// Define the component as a standard TypeScript function
function JukeboxPlayer({ token, trackUri, onSongEnd }: JukeboxPlayerProps): null {
  const { deviceId } = useSpotifyPlayer(token, trackUri, onSongEnd);

  console.log('Device ID:', deviceId);

  // Return null explicitly since this component doesn't render anything
  return null;
}

export default JukeboxPlayer;

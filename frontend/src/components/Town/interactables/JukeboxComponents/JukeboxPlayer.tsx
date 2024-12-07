// src/components/Town/interactables/JukeboxComponents/JukeboxPlayer.tsx

import useSpotifyPlayer from '../../../../hooks/useSpotifyPlayer';
import { Song } from '../../../../types/CoveyTownSocket';

interface JukeboxPlayerProps {
  token: string; // Spotify OAuth token from backend
  queue: Song[]; // Queue of songs to play
  onSongEnd: () => void; // Callback when a song ends
}

// Define the component as a standard TypeScript function
function JukeboxPlayer({ token, queue, onSongEnd }: JukeboxPlayerProps): null {
  const { deviceId } = useSpotifyPlayer(token, queue, onSongEnd);

  console.log('Device ID:', deviceId);

  // Return null explicitly since this component doesn't render anything
  return null;
}

export default JukeboxPlayer;

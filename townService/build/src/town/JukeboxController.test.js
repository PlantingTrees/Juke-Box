import JukeboxController from './JukeboxController';
describe('JukeboxController', () => {
    let controller;
    beforeEach(() => {
        controller = new JukeboxController();
    });
    it('should add a song to the queue', () => {
        const song = {
            artistName: 'young thug',
            songName: 'Dreamer',
            albumName: 'Free Gucci',
            artworkUrl: 'Spotify.com/youngthug',
            songDurationSec: 30,
            trackUri: '/youngthug',
        };
        controller.addToQueue(song);
        expect(controller.localQueue).toHaveLength(1);
        expect(controller.localQueue[0]).toEqual(song);
    });
    it('should remove a song from the queue', () => {
        const song = {
            artistName: 'young',
            songName: 'Dr',
            albumName: 'Gucci',
            artworkUrl: 'Spotify.com/thug',
            songDurationSec: 34,
            trackUri: '/thug',
        };
        controller.addToQueue(song);
        controller.removeFromQueue();
        expect(controller.localQueue).toHaveLength(0);
    });
    it('should return false for isSongPlaying', () => {
        expect(controller.isSongPlaying()).toBe(false);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSnVrZWJveENvbnRyb2xsZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90b3duL0p1a2Vib3hDb250cm9sbGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxpQkFBaUIsTUFBTSxxQkFBcUIsQ0FBQztBQUdwRCxRQUFRLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxFQUFFO0lBQ2pDLElBQUksVUFBNkIsQ0FBQztJQUVsQyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ2QsVUFBVSxHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztJQUN2QyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7UUFDeEMsTUFBTSxJQUFJLEdBQVM7WUFDakIsVUFBVSxFQUFFLFlBQVk7WUFDeEIsUUFBUSxFQUFFLFNBQVM7WUFDbkIsU0FBUyxFQUFFLFlBQVk7WUFDdkIsVUFBVSxFQUFFLHVCQUF1QjtZQUNuQyxlQUFlLEVBQUUsRUFBRTtZQUNuQixRQUFRLEVBQUUsWUFBWTtTQUN2QixDQUFDO1FBQ0YsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7UUFDN0MsTUFBTSxJQUFJLEdBQVM7WUFDakIsVUFBVSxFQUFFLE9BQU87WUFDbkIsUUFBUSxFQUFFLElBQUk7WUFDZCxTQUFTLEVBQUUsT0FBTztZQUNsQixVQUFVLEVBQUUsa0JBQWtCO1lBQzlCLGVBQWUsRUFBRSxFQUFFO1lBQ25CLFFBQVEsRUFBRSxPQUFPO1NBQ2xCLENBQUM7UUFDRixVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM3QixNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLEVBQUU7UUFDL0MsTUFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIn0=
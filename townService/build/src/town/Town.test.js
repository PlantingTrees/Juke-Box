import { mockClear, mockDeep, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import TwilioVideo from '../lib/TwilioVideo';
import { expectArraysToContainSameMembers, getEventListener, getLastEmittedEvent, mockPlayer, } from '../TestUtils';
import Town from './Town';
const mockTwilioVideo = mockDeep();
jest.spyOn(TwilioVideo, 'getInstance').mockReturnValue(mockTwilioVideo);
const testingMaps = {
    twoConv: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    twoJukebox: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'JukeboxArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'JukeboxArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    overlapping: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 40,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    noObjects: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [],
    },
    duplicateNames: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    twoViewing: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ViewingArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ViewingArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    twoConvOneViewing: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                    {
                        type: 'ViewingArea',
                        height: 237,
                        id: 54,
                        name: 'Name3',
                        properties: [
                            {
                                name: 'video',
                                type: 'string',
                                value: 'someURL',
                            },
                        ],
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 155,
                        y: 566,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    twoConvTwoViewing: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                    {
                        type: 'ViewingArea',
                        height: 237,
                        id: 54,
                        name: 'Name3',
                        properties: [
                            {
                                name: 'video',
                                type: 'string',
                                value: 'someURL',
                            },
                        ],
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 155,
                        y: 566,
                    },
                    {
                        type: 'ViewingArea',
                        height: 237,
                        id: 55,
                        name: 'Name4',
                        properties: [
                            {
                                name: 'video',
                                type: 'string',
                                value: 'someURL',
                            },
                        ],
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 600,
                        y: 1200,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
};
describe('Town', () => {
    const townEmitter = mockDeep();
    let town;
    let player;
    let playerTestData;
    beforeEach(async () => {
        town = new Town(nanoid(), false, nanoid(), townEmitter);
        playerTestData = mockPlayer(town.townID);
        player = await town.addPlayer(playerTestData.userName, playerTestData.socket);
        playerTestData.player = player;
        playerTestData.moveTo(-1, -1);
        mockReset(townEmitter);
    });
    it('constructor should set its properties', () => {
        const townName = `FriendlyNameTest-${nanoid()}`;
        const townID = nanoid();
        const testTown = new Town(townName, true, townID, townEmitter);
        expect(testTown.friendlyName).toBe(townName);
        expect(testTown.townID).toBe(townID);
        expect(testTown.isPubliclyListed).toBe(true);
    });
    describe('addPlayer', () => {
        it('should use the townID and player ID properties when requesting a video token', async () => {
            const newPlayer = mockPlayer(town.townID);
            mockTwilioVideo.getTokenForTown.mockClear();
            const newPlayerObj = await town.addPlayer(newPlayer.userName, newPlayer.socket);
            expect(mockTwilioVideo.getTokenForTown).toBeCalledTimes(1);
            expect(mockTwilioVideo.getTokenForTown).toBeCalledWith(town.townID, newPlayerObj.id);
        });
        it('should register callbacks for all client-to-server events', () => {
            const expectedEvents = [
                'disconnect',
                'chatMessage',
                'playerMovement',
                'interactableUpdate',
            ];
            expectedEvents.forEach(eachEvent => expect(getEventListener(playerTestData.socket, eachEvent)).toBeDefined());
        });
        describe('[T1] interactableUpdate callback', () => {
            let interactableUpdateHandler;
            beforeEach(() => {
                town.initializeFromMap(testingMaps.twoConvTwoViewing);
                interactableUpdateHandler = getEventListener(playerTestData.socket, 'interactableUpdate');
            });
            it('Should not throw an error for any interactable area that is not a viewing area', () => {
                expect(() => interactableUpdateHandler({ id: 'Name1', topic: nanoid(), occupantsByID: [] })).not.toThrowError();
            });
            it('Should not throw an error if there is no such viewing area', () => {
                expect(() => interactableUpdateHandler({
                    id: 'NotActuallyAnInteractable',
                    topic: nanoid(),
                    occupantsByID: [],
                })).not.toThrowError();
            });
            describe('When called passing a valid viewing area', () => {
                let newArea;
                let secondPlayer;
                beforeEach(async () => {
                    newArea = {
                        id: 'Name4',
                        elapsedTimeSec: 0,
                        isPlaying: true,
                        video: nanoid(),
                    };
                    expect(town.addViewingArea(newArea)).toBe(true);
                    secondPlayer = mockPlayer(town.townID);
                    mockTwilioVideo.getTokenForTown.mockClear();
                    await town.addPlayer(secondPlayer.userName, secondPlayer.socket);
                    newArea.elapsedTimeSec = 100;
                    newArea.isPlaying = false;
                    mockClear(townEmitter);
                    mockClear(secondPlayer.socket);
                    mockClear(secondPlayer.socketToRoomMock);
                    interactableUpdateHandler(newArea);
                });
                it("Should emit the interactable update to the other players in the town using the player's townEmitter, after the viewing area was successfully created", () => {
                    const updatedArea = town.getInteractable(newArea.id);
                    expect(updatedArea.toModel()).toEqual(newArea);
                });
                it('Should update the model for the viewing area', () => {
                    const lastUpdate = getLastEmittedEvent(playerTestData.socketToRoomMock, 'interactableUpdate');
                    expect(lastUpdate).toEqual(newArea);
                });
                it('Should not emit interactableUpdate events to players directly, or to the whole town', () => {
                    expect(() => getLastEmittedEvent(playerTestData.socket, 'interactableUpdate')).toThrowError();
                    expect(() => getLastEmittedEvent(townEmitter, 'interactableUpdate')).toThrowError();
                    expect(() => getLastEmittedEvent(secondPlayer.socket, 'interactableUpdate')).toThrowError();
                    expect(() => getLastEmittedEvent(secondPlayer.socketToRoomMock, 'interactableUpdate')).toThrowError();
                });
            });
        });
    });
    describe('Socket event listeners created in addPlayer', () => {
        describe('on socket disconnect', () => {
            function disconnectPlayer(playerToLeave) {
                const disconnectHandler = getEventListener(playerToLeave.socket, 'disconnect');
                disconnectHandler('unknown');
            }
            it("Invalidates the players's session token", async () => {
                const token = player.sessionToken;
                expect(town.getPlayerBySessionToken(token)).toBe(player);
                disconnectPlayer(playerTestData);
                expect(town.getPlayerBySessionToken(token)).toEqual(undefined);
            });
            it('Informs all other players of the disconnection using the broadcast emitter', () => {
                const playerToLeaveID = player.id;
                disconnectPlayer(playerTestData);
                const callToDisconnect = getLastEmittedEvent(townEmitter, 'playerDisconnect');
                expect(callToDisconnect.id).toEqual(playerToLeaveID);
            });
            it('Removes the player from any active conversation area', () => {
                town.initializeFromMap(testingMaps.twoConvOneViewing);
                playerTestData.moveTo(45, 122);
                expect(town.addConversationArea({ id: 'Name1', topic: 'test', occupantsByID: [] })).toBeTruthy();
                const convArea = town.getInteractable('Name1');
                expect(convArea.occupantsByID).toEqual([player.id]);
                disconnectPlayer(playerTestData);
                expect(convArea.occupantsByID).toEqual([]);
                expect(town.occupancy).toBe(0);
            });
            it('Removes the player from any active viewing area', () => {
                town.initializeFromMap(testingMaps.twoConvOneViewing);
                playerTestData.moveTo(156, 567);
                expect(town.addViewingArea({ id: 'Name3', isPlaying: true, elapsedTimeSec: 0, video: nanoid() })).toBeTruthy();
                const viewingArea = town.getInteractable('Name3');
                expect(viewingArea.occupantsByID).toEqual([player.id]);
                disconnectPlayer(playerTestData);
                expect(viewingArea.occupantsByID).toEqual([]);
            });
            it('Removes the player from any active jukebox area', () => {
                town.initializeFromMap(testingMaps.twoJukebox);
                playerTestData.moveTo(45, 122);
                expect(town.addJukeboxArea({
                    id: 'Name1',
                    isPlaying: false,
                    queue: [],
                    volume: 0,
                    searchList: [],
                })).toBeTruthy();
                const juekboxArea = town.getInteractable('Name1');
                expect(juekboxArea.occupantsByID).toEqual([player.id]);
                disconnectPlayer(playerTestData);
                expect(juekboxArea.occupantsByID).toEqual([]);
                expect(town.occupancy).toBe(0);
            });
        });
        describe('playerMovement', () => {
            const newLocation = {
                x: 100,
                y: 100,
                rotation: 'back',
                moving: true,
            };
            beforeEach(() => {
                playerTestData.moveTo(newLocation.x, newLocation.y, newLocation.rotation, newLocation.moving);
            });
            it('Emits a playerMoved event', () => {
                const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
                expect(lastEmittedMovement.id).toEqual(playerTestData.player?.id);
                expect(lastEmittedMovement.location).toEqual(newLocation);
            });
            it("Updates the player's location", () => {
                expect(player.location).toEqual(newLocation);
            });
        });
        describe('interactableUpdate', () => {
            let interactableUpdateCallback;
            let update;
            beforeEach(async () => {
                town.initializeFromMap(testingMaps.twoConvOneViewing);
                playerTestData.moveTo(156, 567);
                interactableUpdateCallback = getEventListener(playerTestData.socket, 'interactableUpdate');
                update = {
                    id: 'Name3',
                    isPlaying: true,
                    elapsedTimeSec: 100,
                    video: nanoid(),
                };
                interactableUpdateCallback(update);
            });
            it('forwards updates to others in the town', () => {
                const lastEvent = getLastEmittedEvent(playerTestData.socketToRoomMock, 'interactableUpdate');
                expect(lastEvent).toEqual(update);
            });
            it('does not forward updates to the ENTIRE town', () => {
                expect(() => getLastEmittedEvent(townEmitter, 'interactableUpdate')).toThrowError();
            });
            it('updates the local model for that interactable', () => {
                const interactable = town.getInteractable(update.id);
                expect(interactable?.toModel()).toEqual(update);
            });
        });
        it('Forwards chat messages to all players in the same town', async () => {
            const chatHandler = getEventListener(playerTestData.socket, 'chatMessage');
            const chatMessage = {
                author: player.id,
                body: 'Test message',
                dateCreated: new Date(),
                sid: 'test message id',
            };
            chatHandler(chatMessage);
            const emittedMessage = getLastEmittedEvent(townEmitter, 'chatMessage');
            expect(emittedMessage).toEqual(chatMessage);
        });
    });
    describe('addConversationArea', () => {
        beforeEach(async () => {
            town.initializeFromMap(testingMaps.twoConvOneViewing);
        });
        it('Should return false if no area exists with that ID', () => {
            expect(town.addConversationArea({ id: nanoid(), topic: nanoid(), occupantsByID: [] })).toEqual(false);
        });
        it('Should return false if the requested topic is empty', () => {
            expect(town.addConversationArea({ id: 'Name1', topic: '', occupantsByID: [] })).toEqual(false);
            expect(town.addConversationArea({ id: 'Name1', topic: undefined, occupantsByID: [] })).toEqual(false);
        });
        it('Should return false if the area already has a topic', () => {
            expect(town.addConversationArea({ id: 'Name1', topic: 'new topic', occupantsByID: [] })).toEqual(true);
            expect(town.addConversationArea({ id: 'Name1', topic: 'new new topic', occupantsByID: [] })).toEqual(false);
        });
        describe('When successful', () => {
            const newTopic = 'new topic';
            beforeEach(() => {
                playerTestData.moveTo(45, 122);
                expect(town.addConversationArea({ id: 'Name1', topic: newTopic, occupantsByID: [] })).toEqual(true);
            });
            it('Should update the local model for that area', () => {
                const convArea = town.getInteractable('Name1');
                expect(convArea.topic).toEqual(newTopic);
            });
            it('Should include any players in that area as occupants', () => {
                const convArea = town.getInteractable('Name1');
                expect(convArea.occupantsByID).toEqual([player.id]);
            });
            it('Should emit an interactableUpdate message', () => {
                const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
                expect(lastEmittedUpdate).toEqual({
                    id: 'Name1',
                    topic: newTopic,
                    occupantsByID: [player.id],
                });
            });
        });
    });
    describe('[T1] addViewingArea', () => {
        beforeEach(async () => {
            town.initializeFromMap(testingMaps.twoConvOneViewing);
        });
        it('Should return false if no area exists with that ID', () => {
            expect(town.addViewingArea({ id: nanoid(), isPlaying: false, elapsedTimeSec: 0, video: nanoid() })).toBe(false);
        });
        it('Should return false if the requested video is empty', () => {
            expect(town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: '' })).toBe(false);
            expect(town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: undefined })).toBe(false);
        });
        it('Should return false if the area is already active', () => {
            expect(town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: 'test' })).toBe(true);
            expect(town.addViewingArea({ id: 'Name3', isPlaying: false, elapsedTimeSec: 0, video: 'test2' })).toBe(false);
        });
        describe('When successful', () => {
            const newModel = {
                id: 'Name3',
                isPlaying: true,
                elapsedTimeSec: 100,
                video: nanoid(),
            };
            beforeEach(() => {
                playerTestData.moveTo(160, 570);
                expect(town.addViewingArea(newModel)).toBe(true);
            });
            it('Should update the local model for that area', () => {
                const viewingArea = town.getInteractable('Name3');
                expect(viewingArea.toModel()).toEqual(newModel);
            });
            it('Should emit an interactableUpdate message', () => {
                const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
                expect(lastEmittedUpdate).toEqual(newModel);
            });
            it('Should include any players in that area as occupants', () => {
                const viewingArea = town.getInteractable('Name3');
                expect(viewingArea.occupantsByID).toEqual([player.id]);
            });
        });
    });
    describe('disconnectAllPlayers', () => {
        beforeEach(() => {
            town.disconnectAllPlayers();
        });
        it('Should emit the townClosing event', () => {
            getLastEmittedEvent(townEmitter, 'townClosing');
        });
        it("Should disconnect each players's socket", () => {
            expect(playerTestData.socket.disconnect).toBeCalledWith(true);
        });
    });
    describe('initializeFromMap', () => {
        const expectInitializingFromMapToThrowError = (map) => {
            expect(() => town.initializeFromMap(map)).toThrowError();
        };
        it('Throws an error if there is no layer called "objects"', async () => {
            expectInitializingFromMapToThrowError(testingMaps.noObjects);
        });
        it('Throws an error if there are duplicate interactable object IDs', async () => {
            expectInitializingFromMapToThrowError(testingMaps.duplicateNames);
        });
        it('Throws an error if there are overlapping objects', async () => {
            expectInitializingFromMapToThrowError(testingMaps.overlapping);
        });
        it('Creates a ConversationArea instance for each region on the map', async () => {
            town.initializeFromMap(testingMaps.twoConv);
            const conv1 = town.getInteractable('Name1');
            const conv2 = town.getInteractable('Name2');
            expect(conv1.id).toEqual('Name1');
            expect(conv1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
            expect(conv2.id).toEqual('Name2');
            expect(conv2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
            expect(town.interactables.length).toBe(2);
        });
        it('Creates a ViewingArea instance for each region on the map', async () => {
            town.initializeFromMap(testingMaps.twoViewing);
            const viewingArea1 = town.getInteractable('Name1');
            const viewingArea2 = town.getInteractable('Name2');
            expect(viewingArea1.id).toEqual('Name1');
            expect(viewingArea1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
            expect(viewingArea2.id).toEqual('Name2');
            expect(viewingArea2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
            expect(town.interactables.length).toBe(2);
        });
        it('Creates a JukeboxArea instance for each region on the map', async () => {
            town.initializeFromMap(testingMaps.twoJukebox);
            const jukeboxArea1 = town.getInteractable('Name1');
            const jukeboxArea2 = town.getInteractable('Name2');
            expect(jukeboxArea1.id).toEqual('Name1');
            expect(jukeboxArea1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
            expect(jukeboxArea2.id).toEqual('Name2');
            expect(jukeboxArea2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
            expect(town.interactables.length).toBe(2);
        });
        describe('Updating interactable state in playerMovements', () => {
            beforeEach(async () => {
                town.initializeFromMap(testingMaps.twoConvOneViewing);
                playerTestData.moveTo(51, 121);
                expect(town.addConversationArea({ id: 'Name1', topic: 'test', occupantsByID: [] })).toBe(true);
            });
            it('Adds a player to a new interactable and sets their conversation label, if they move into it', async () => {
                const newPlayer = mockPlayer(town.townID);
                const newPlayerObj = await town.addPlayer(newPlayer.userName, newPlayer.socket);
                newPlayer.moveTo(51, 121);
                expect(newPlayerObj.location.interactableID).toEqual('Name1');
                const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
                expect(lastEmittedMovement.location.interactableID).toEqual('Name1');
                const occupants = town.getInteractable('Name1').occupantsByID;
                expectArraysToContainSameMembers(occupants, [newPlayerObj.id, player.id]);
            });
            it('Removes a player from their prior interactable and sets their conversation label, if they moved outside of it', () => {
                expect(player.location.interactableID).toEqual('Name1');
                playerTestData.moveTo(0, 0);
                expect(player.location.interactableID).toBeUndefined();
            });
        });
    });
    describe('Updating town settings', () => {
        it('Emits townSettingsUpdated events when friendlyName changes', async () => {
            const newFriendlyName = nanoid();
            town.friendlyName = newFriendlyName;
            expect(townEmitter.emit).toBeCalledWith('townSettingsUpdated', {
                friendlyName: newFriendlyName,
            });
        });
        it('Emits townSettingsUpdated events when isPubliclyListed changes', async () => {
            const expected = !town.isPubliclyListed;
            town.isPubliclyListed = expected;
            expect(townEmitter.emit).toBeCalledWith('townSettingsUpdated', {
                isPubliclyListed: expected,
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvd24vVG93bi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNuRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBRWhDLE9BQU8sV0FBVyxNQUFNLG9CQUFvQixDQUFDO0FBQzdDLE9BQU8sRUFFTCxnQ0FBZ0MsRUFDaEMsZ0JBQWdCLEVBQ2hCLG1CQUFtQixFQUVuQixVQUFVLEdBQ1gsTUFBTSxjQUFjLENBQUM7QUFVdEIsT0FBTyxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBRzFCLE1BQU0sZUFBZSxHQUFHLFFBQVEsRUFBZSxDQUFDO0FBQ2hELElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUt4RSxNQUFNLFdBQVcsR0FBZ0I7SUFDL0IsT0FBTyxFQUFFO1FBQ1AsWUFBWSxFQUFFLE9BQU87UUFDckIsVUFBVSxFQUFFLEVBQUU7UUFDZCxRQUFRLEVBQUUsRUFBRTtRQUNaLFNBQVMsRUFBRSxFQUFFO1FBQ2IsSUFBSSxFQUFFLEtBQUs7UUFDWCxNQUFNLEVBQUU7WUFDTjtnQkFDRSxFQUFFLEVBQUUsQ0FBQztnQkFDTCxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUU7b0JBQ1A7d0JBQ0UsSUFBSSxFQUFFLGtCQUFrQjt3QkFDeEIsTUFBTSxFQUFFLEdBQUc7d0JBQ1gsRUFBRSxFQUFFLEVBQUU7d0JBQ04sSUFBSSxFQUFFLE9BQU87d0JBQ2IsUUFBUSxFQUFFLENBQUM7d0JBQ1gsT0FBTyxFQUFFLElBQUk7d0JBQ2IsS0FBSyxFQUFFLEdBQUc7d0JBQ1YsQ0FBQyxFQUFFLEVBQUU7d0JBQ0wsQ0FBQyxFQUFFLEdBQUc7cUJBQ1A7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
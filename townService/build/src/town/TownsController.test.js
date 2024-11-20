import assert from 'assert';
import { mockDeep } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import TownsStore from '../lib/TownsStore';
import { createConversationForTesting, getLastEmittedEvent, extractSessionToken, mockPlayer, isViewingArea, isConversationArea, isJukeboxArea, } from '../TestUtils';
import { TownsController } from './TownsController';
function expectTownListMatches(towns, town) {
    const matching = towns.find(townInfo => townInfo.townID === town.townID);
    if (town.isPubliclyListed) {
        expect(matching).toBeDefined();
        assert(matching);
        expect(matching.friendlyName).toBe(town.friendlyName);
    }
    else {
        expect(matching).toBeUndefined();
    }
}
const broadcastEmitter = jest.fn();
describe('TownsController integration tests', () => {
    let controller;
    const createdTownEmitters = new Map();
    async function createTownForTesting(friendlyNameToUse, isPublic = false) {
        const friendlyName = friendlyNameToUse !== undefined
            ? friendlyNameToUse
            : `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
        const ret = await controller.createTown({
            friendlyName,
            isPubliclyListed: isPublic,
            mapFile: 'testData/indoors.json',
        });
        return {
            friendlyName,
            isPubliclyListed: isPublic,
            townID: ret.townID,
            townUpdatePassword: ret.townUpdatePassword,
        };
    }
    function getBroadcastEmitterForTownID(townID) {
        const ret = createdTownEmitters.get(townID);
        if (!ret) {
            throw new Error(`Could not find broadcast emitter for ${townID}`);
        }
        return ret;
    }
    beforeAll(() => {
        process.env.TWILIO_API_AUTH_TOKEN = 'testing';
        process.env.TWILIO_ACCOUNT_SID = 'ACtesting';
        process.env.TWILIO_API_KEY_SID = 'testing';
        process.env.TWILIO_API_KEY_SECRET = 'testing';
    });
    beforeEach(async () => {
        createdTownEmitters.clear();
        broadcastEmitter.mockImplementation((townID) => {
            const mockRoomEmitter = mockDeep();
            createdTownEmitters.set(townID, mockRoomEmitter);
            return mockRoomEmitter;
        });
        TownsStore.initializeTownsStore(broadcastEmitter);
        controller = new TownsController();
    });
    describe('createTown', () => {
        it('Allows for multiple towns with the same friendlyName', async () => {
            const firstTown = await createTownForTesting();
            const secondTown = await createTownForTesting(firstTown.friendlyName);
            expect(firstTown.townID).not.toBe(secondTown.townID);
        });
        it('Prohibits a blank friendlyName', async () => {
            await expect(createTownForTesting('')).rejects.toThrowError();
        });
    });
    describe('listTowns', () => {
        it('Lists public towns, but not private towns', async () => {
            const pubTown1 = await createTownForTesting(undefined, true);
            const privTown1 = await createTownForTesting(undefined, false);
            const pubTown2 = await createTownForTesting(undefined, true);
            const privTown2 = await createTownForTesting(undefined, false);
            const towns = await controller.listTowns();
            expectTownListMatches(towns, pubTown1);
            expectTownListMatches(towns, pubTown2);
            expectTownListMatches(towns, privTown1);
            expectTownListMatches(towns, privTown2);
        });
        it('Allows for multiple towns with the same friendlyName', async () => {
            const pubTown1 = await createTownForTesting(undefined, true);
            const privTown1 = await createTownForTesting(pubTown1.friendlyName, false);
            const pubTown2 = await createTownForTesting(pubTown1.friendlyName, true);
            const privTown2 = await createTownForTesting(pubTown1.friendlyName, false);
            const towns = await controller.listTowns();
            expectTownListMatches(towns, pubTown1);
            expectTownListMatches(towns, pubTown2);
            expectTownListMatches(towns, privTown1);
            expectTownListMatches(towns, privTown2);
        });
    });
    describe('deleteTown', () => {
        it('Throws an error if the password is invalid', async () => {
            const { townID } = await createTownForTesting(undefined, true);
            await expect(controller.deleteTown(townID, nanoid())).rejects.toThrowError();
        });
        it('Throws an error if the townID is invalid', async () => {
            const { townUpdatePassword } = await createTownForTesting(undefined, true);
            await expect(controller.deleteTown(nanoid(), townUpdatePassword)).rejects.toThrowError();
        });
        it('Deletes a town if given a valid password and town, no longer allowing it to be joined or listed', async () => {
            const { townID, townUpdatePassword } = await createTownForTesting(undefined, true);
            await controller.deleteTown(townID, townUpdatePassword);
            const { socket } = mockPlayer(townID);
            await controller.joinTown(socket);
            expect(socket.emit).not.toHaveBeenCalled();
            expect(socket.disconnect).toHaveBeenCalled();
            const listedTowns = await controller.listTowns();
            if (listedTowns.find(r => r.townID === townID)) {
                fail('Expected the deleted town to no longer be listed');
            }
        });
        it('Informs all players when a town is destroyed using the broadcast emitter and then disconnects them', async () => {
            const town = await createTownForTesting();
            const players = await Promise.all([...Array(10)].map(async () => {
                const player = mockPlayer(town.townID);
                await controller.joinTown(player.socket);
                return player;
            }));
            const townEmitter = getBroadcastEmitterForTownID(town.townID);
            await controller.deleteTown(town.townID, town.townUpdatePassword);
            getLastEmittedEvent(townEmitter, 'townClosing');
            players.forEach(eachPlayer => expect(eachPlayer.socket.disconnect).toBeCalledWith(true));
        });
    });
    describe('updateTown', () => {
        it('Checks the password before updating any values', async () => {
            const pubTown1 = await createTownForTesting(undefined, true);
            expectTownListMatches(await controller.listTowns(), pubTown1);
            await expect(controller.updateTown(pubTown1.townID, `${pubTown1.townUpdatePassword}*`, {
                friendlyName: 'broken',
                isPubliclyListed: false,
            })).rejects.toThrowError();
            expectTownListMatches(await controller.listTowns(), pubTown1);
        });
        it('Updates the friendlyName and visbility as requested', async () => {
            const pubTown1 = await createTownForTesting(undefined, false);
            expectTownListMatches(await controller.listTowns(), pubTown1);
            await controller.updateTown(pubTown1.townID, pubTown1.townUpdatePassword, {
                friendlyName: 'newName',
                isPubliclyListed: true,
            });
            pubTown1.friendlyName = 'newName';
            pubTown1.isPubliclyListed = true;
            expectTownListMatches(await controller.listTowns(), pubTown1);
        });
        it('Should fail if the townID does not exist', async () => {
            await expect(controller.updateTown(nanoid(), nanoid(), { friendlyName: 'test', isPubliclyListed: true })).rejects.toThrow();
        });
    });
    describe('joinTown', () => {
        it('Disconnects the socket if the town does not exist', async () => {
            await createTownForTesting(undefined, true);
            const { socket } = mockPlayer(nanoid());
            await controller.joinTown(socket);
            expect(socket.emit).not.toHaveBeenCalled();
            expect(socket.disconnect).toHaveBeenCalled();
        });
        it('Admits a user to a valid public or private town and sends back initial data', async () => {
            const joinAndCheckInitialData = async (publiclyListed) => {
                const town = await createTownForTesting(undefined, publiclyListed);
                const player = mockPlayer(town.townID);
                await controller.joinTown(player.socket);
                expect(player.socket.emit).toHaveBeenCalled();
                expect(player.socket.disconnect).not.toHaveBeenCalled();
                const initialData = getLastEmittedEvent(player.socket, 'initialize');
                expect(initialData.friendlyName).toEqual(town.friendlyName);
                expect(initialData.isPubliclyListed).toEqual(publiclyListed);
                expect(initialData.interactables.length).toBeGreaterThan(0);
                expect(initialData.providerVideoToken).toBeDefined();
                expect(initialData.sessionToken).toBeDefined();
                expect(initialData.currentPlayers.length).toBe(1);
                expect(initialData.currentPlayers[0].userName).toEqual(player.userName);
                expect(initialData.currentPlayers[0].id).toEqual(initialData.userID);
            };
            await joinAndCheckInitialData(true);
            await joinAndCheckInitialData(false);
        });
        it('Includes active conversation areas in the initial join data', async () => {
            const town = await createTownForTesting(undefined, true);
            const player = mockPlayer(town.townID);
            await controller.joinTown(player.socket);
            const initialData = getLastEmittedEvent(player.socket, 'initialize');
            const conversationArea = createConversationForTesting({
                boundingBox: { x: 10, y: 10, width: 1, height: 1 },
                conversationID: initialData.interactables.find(eachInteractable => 'occupantsByID' in eachInteractable)?.id,
            });
            await controller.createConversationArea(town.townID, extractSessionToken(player), conversationArea);
            const player2 = mockPlayer(town.townID);
            await controller.joinTown(player2.socket);
            const initialData2 = getLastEmittedEvent(player2.socket, 'initialize');
            const createdArea = initialData2.interactables.find(eachInteractable => eachInteractable.id === conversationArea.id);
            expect(createdArea.topic).toEqual(conversationArea.topic);
            expect(initialData2.interactables.length).toEqual(initialData.interactables.length);
        });
    });
    describe('Interactables', () => {
        let testingTown;
        let player;
        let sessionToken;
        let interactables;
        beforeEach(async () => {
            testingTown = await createTownForTesting(undefined, true);
            player = mockPlayer(testingTown.townID);
            await controller.joinTown(player.socket);
            const initialData = getLastEmittedEvent(player.socket, 'initialize');
            sessionToken = initialData.sessionToken;
            interactables = initialData.interactables;
        });
        describe('Create Conversation Area', () => {
            it('Executes without error when creating a new conversation', async () => {
                await controller.createConversationArea(testingTown.townID, sessionToken, createConversationForTesting({
                    conversationID: interactables.find(isConversationArea)?.id,
                }));
            });
            it('Returns an error message if the town ID is invalid', async () => {
                await expect(controller.createConversationArea(nanoid(), sessionToken, createConversationForTesting())).rejects.toThrow();
            });
            it('Checks for a valid session token before creating a conversation area', async () => {
                const conversationArea = createConversationForTesting();
                const invalidSessionToken = nanoid();
                await expect(controller.createConversationArea(testingTown.townID, invalidSessionToken, conversationArea)).rejects.toThrow();
            });
            it('Returns an error message if addConversation returns false', async () => {
                const conversationArea = createConversationForTesting();
                await expect(controller.createConversationArea(testingTown.townID, sessionToken, conversationArea)).rejects.toThrow();
            });
        });
        describe('[T1] Create Viewing Area', () => {
            it('Executes without error when creating a new viewing area', async () => {
                const viewingArea = interactables.find(isViewingArea);
                if (!viewingArea) {
                    fail('Expected at least one viewing area to be returned in the initial join data');
                }
                else {
                    const newViewingArea = {
                        elapsedTimeSec: 100,
                        id: viewingArea.id,
                        video: nanoid(),
                        isPlaying: true,
                    };
                    await controller.createViewingArea(testingTown.townID, sessionToken, newViewingArea);
                    const townEmitter = getBroadcastEmitterForTownID(testingTown.townID);
                    const updateMessage = getLastEmittedEvent(townEmitter, 'interactableUpdate');
                    if (isViewingArea(updateMessage)) {
                        expect(updateMessage).toEqual(newViewingArea);
                    }
                    else {
                        fail('Expected an interactableUpdate to be dispatched with the new viewing area');
                    }
                }
            });
            it('Returns an error message if the town ID is invalid', async () => {
                const viewingArea = interactables.find(isViewingArea);
                const newViewingArea = {
                    elapsedTimeSec: 100,
                    id: viewingArea.id,
                    video: nanoid(),
                    isPlaying: true,
                };
                await expect(controller.createViewingArea(nanoid(), sessionToken, newViewingArea)).rejects.toThrow();
            });
            it('Checks for a valid session token before creating a viewing area', async () => {
                const invalidSessionToken = nanoid();
                const viewingArea = interactables.find(isViewingArea);
                const newViewingArea = {
                    elapsedTimeSec: 100,
                    id: viewingArea.id,
                    video: nanoid(),
                    isPlaying: true,
                };
                await expect(controller.createViewingArea(testingTown.townID, invalidSessionToken, newViewingArea)).rejects.toThrow();
            });
            it('Returns an error message if addViewingArea returns false', async () => {
                const viewingArea = interactables.find(isViewingArea);
                viewingArea.id = nanoid();
                await expect(controller.createViewingArea(testingTown.townID, sessionToken, viewingArea)).rejects.toThrow();
            });
        });
        describe('[T2] Create Jukebox Area', () => {
            it('Executes without error when creating a new jukebox area', async () => {
                const jukeboxArea = interactables.find(isJukeboxArea);
                if (!jukeboxArea) {
                    fail('Expected at least one jukebox area to be returned in the initial join data');
                }
                else {
                    const newJukeboxArea = {
                        id: jukeboxArea.id,
                        isPlaying: false,
                        queue: [],
                        volume: 0,
                        searchList: [],
                    };
                    await controller.createJukeboxArea(testingTown.townID, sessionToken, newJukeboxArea);
                    const townEmitter = getBroadcastEmitterForTownID(testingTown.townID);
                    const updateMessage = getLastEmittedEvent(townEmitter, 'interactableUpdate');
                    if (isJukeboxArea(updateMessage)) {
                        expect(updateMessage).toEqual(newJukeboxArea);
                    }
                    else {
                        fail('Expected an interactableUpdate to be dispatched with the new jukebox area');
                    }
                }
            });
            it('Returns an error message if the town ID is invalid', async () => {
                const jukeboxArea = interactables.find(isJukeboxArea);
                const newJukeboxArea = {
                    id: jukeboxArea.id,
                    isPlaying: false,
                    queue: [],
                    volume: 0,
                    searchList: [],
                };
                await expect(controller.createJukeboxArea(nanoid(), sessionToken, newJukeboxArea)).rejects.toThrow();
            });
            it('Checks for a valid session token before creating a jukebox area', async () => {
                const invalidSessionToken = nanoid();
                const jukeboxArea = interactables.find(isJukeboxArea);
                const newJukeboxArea = {
                    id: jukeboxArea.id,
                    isPlaying: false,
                    queue: [],
                    volume: 0,
                    searchList: [],
                };
                await expect(controller.createJukeboxArea(testingTown.townID, invalidSessionToken, newJukeboxArea)).rejects.toThrow();
            });
            it('Returns an error message if addJukeboxArea returns false', async () => {
                const jukeboxArea = interactables.find(isJukeboxArea);
                jukeboxArea.id = nanoid();
                await expect(controller.createJukeboxArea(testingTown.townID, sessionToken, jukeboxArea)).rejects.toThrow();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bnNDb250cm9sbGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdG93bi9Ub3duc0NvbnRyb2xsZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxFQUFpQixRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM3RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBU2hDLE9BQU8sVUFBVSxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sRUFDTCw0QkFBNEIsRUFDNUIsbUJBQW1CLEVBQ25CLG1CQUFtQixFQUNuQixVQUFVLEVBQ1YsYUFBYSxFQUNiLGtCQUFrQixFQUVsQixhQUFhLEdBQ2QsTUFBTSxjQUFjLENBQUM7QUFDdEIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBU3BELFNBQVMscUJBQXFCLENBQUMsS0FBYSxFQUFFLElBQWtCO0lBQzlELE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN6RSxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtRQUN6QixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDL0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUN2RDtTQUFNO1FBQ0wsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQ2xDO0FBQ0gsQ0FBQztBQUVELE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ25D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
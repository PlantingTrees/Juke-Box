import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import TwilioVideo from '../lib/TwilioVideo';
import { isJukeboxArea, isViewingArea } from '../TestUtils';
import ConversationArea from './ConversationArea';
import ViewingArea from './ViewingArea';
import JukeboxArea from './JukeboxArea';
export default class Town {
    get capacity() {
        return this._capacity;
    }
    set isPubliclyListed(value) {
        this._isPubliclyListed = value;
        this._broadcastEmitter.emit('townSettingsUpdated', { isPubliclyListed: value });
    }
    get isPubliclyListed() {
        return this._isPubliclyListed;
    }
    get townUpdatePassword() {
        return this._townUpdatePassword;
    }
    get players() {
        return this._players;
    }
    get occupancy() {
        return this.players.length;
    }
    get friendlyName() {
        return this._friendlyName;
    }
    set friendlyName(value) {
        this._friendlyName = value;
        this._broadcastEmitter.emit('townSettingsUpdated', { friendlyName: value });
    }
    get townID() {
        return this._townID;
    }
    get interactables() {
        return this._interactables;
    }
    _players = [];
    _videoClient = TwilioVideo.getInstance();
    _interactables = [];
    _townID;
    _friendlyName;
    _townUpdatePassword;
    _isPubliclyListed;
    _capacity;
    _broadcastEmitter;
    _connectedSockets = new Set();
    constructor(friendlyName, isPubliclyListed, townID, broadcastEmitter) {
        this._townID = townID;
        this._capacity = 50;
        this._townUpdatePassword = nanoid(24);
        this._isPubliclyListed = isPubliclyListed;
        this._friendlyName = friendlyName;
        this._broadcastEmitter = broadcastEmitter;
    }
    async addPlayer(userName, socket) {
        const newPlayer = new Player(userName, socket.to(this._townID));
        this._players.push(newPlayer);
        this._connectedSockets.add(socket);
        newPlayer.videoToken = await this._videoClient.getTokenForTown(this._townID, newPlayer.id);
        this._broadcastEmitter.emit('playerJoined', newPlayer.toPlayerModel());
        socket.on('disconnect', () => {
            this._removePlayer(newPlayer);
            this._connectedSockets.delete(socket);
        });
        socket.on('chatMessage', (message) => {
            this._broadcastEmitter.emit('chatMessage', message);
        });
        socket.on('playerMovement', (movementData) => {
            this._updatePlayerLocation(newPlayer, movementData);
        });
        socket.on('interactableUpdate', (update) => {
            if (isViewingArea(update) && !isJukeboxArea(update)) {
                newPlayer.townEmitter.emit('interactableUpdate', update);
                const viewingArea = this._interactables.find(eachInteractable => eachInteractable.id === update.id);
                if (viewingArea) {
                    viewingArea.updateModel(update);
                }
            }
            if (isJukeboxArea(update)) {
                newPlayer.townEmitter.emit('interactableUpdate', update);
                const jukeboxArea = this._interactables.find(eachInteractable => eachInteractable.id === update.id);
                if (jukeboxArea) {
                    jukeboxArea.updateModel(update);
                }
            }
        });
        return newPlayer;
    }
    _removePlayer(player) {
        if (player.location.interactableID) {
            this._removePlayerFromInteractable(player);
        }
        this._players = this._players.filter(p => p.id !== player.id);
        this._broadcastEmitter.emit('playerDisconnect', player.toPlayerModel());
    }
    _updatePlayerLocation(player, location) {
        const prevInteractable = this._interactables.find(conv => conv.id === player.location.interactableID);
        if (!prevInteractable?.contains(location)) {
            if (prevInteractable) {
                prevInteractable.remove(player);
            }
            const newInteractable = this._interactables.find(eachArea => eachArea.isActive && eachArea.contains(location));
            if (newInteractable) {
                newInteractable.add(player);
            }
            location.interactableID = newInteractable?.id;
        }
        else {
            location.interactableID = prevInteractable.id;
        }
        player.location = location;
        this._broadcastEmitter.emit('playerMoved', player.toPlayerModel());
    }
    _removePlayerFromInteractable(player) {
        const area = this._interactables.find(eachArea => eachArea.id === player.location.interactableID);
        if (area) {
            area.remove(player);
        }
    }
    addConversationArea(conversationArea) {
        const area = this._interactables.find(eachArea => eachArea.id === conversationArea.id);
        if (!area || !conversationArea.topic || area.topic) {
            return false;
        }
        area.topic = conversationArea.topic;
        area.addPlayersWithinBounds(this._players);
        this._broadcastEmitter.emit('interactableUpdate', area.toModel());
        return true;
    }
    addViewingArea(viewingArea) {
        const area = this._interactables.find(eachArea => eachArea.id === viewingArea.id);
        if (!area || !viewingArea.video || area.video) {
            return false;
        }
        area.updateModel(viewingArea);
        area.addPlayersWithinBounds(this._players);
        this._broadcastEmitter.emit('interactableUpdate', area.toModel());
        return true;
    }
    addJukeboxArea(jukeboxArea) {
        const area = this._interactables.find(eachArea => eachArea.id === jukeboxArea.id);
        if (!area) {
            return false;
        }
        area.updateModel(jukeboxArea);
        area.addPlayersWithinBounds(this._players);
        this._broadcastEmitter.emit('interactableUpdate', area.toModel());
        return true;
    }
    getPlayerBySessionToken(token) {
        return this.players.find(eachPlayer => eachPlayer.sessionToken === token);
    }
    getInteractable(id) {
        const ret = this._interactables.find(eachInteractable => eachInteractable.id === id);
        if (!ret) {
            throw new Error(`No such interactable ${id}`);
        }
        return ret;
    }
    disconnectAllPlayers() {
        this._broadcastEmitter.emit('townClosing');
        this._connectedSockets.forEach(eachSocket => eachSocket.disconnect(true));
    }
    initializeFromMap(map) {
        const objectLayer = map.layers.find(eachLayer => eachLayer.name === 'Objects');
        if (!objectLayer) {
            throw new Error(`Unable to find objects layer in map`);
        }
        const viewingAreas = objectLayer.objects
            .filter(eachObject => eachObject.type === 'ViewingArea')
            .map(eachViewingAreaObject => ViewingArea.fromMapObject(eachViewingAreaObject, this._broadcastEmitter));
        const conversationAreas = objectLayer.objects
            .filter(eachObject => eachObject.type === 'ConversationArea')
            .map(eachConvAreaObj => ConversationArea.fromMapObject(eachConvAreaObj, this._broadcastEmitter));
        const jukeboxAreas = objectLayer.objects
            .filter(eachObject => eachObject.type === 'JukeboxArea')
            .map(eachJukeboxAreaObj => JukeboxArea.fromMapObject(eachJukeboxAreaObj, this._broadcastEmitter));
        this._interactables = this._interactables
            .concat(viewingAreas)
            .concat(conversationAreas)
            .concat(jukeboxAreas);
        this._validateInteractables();
    }
    _validateInteractables() {
        const interactableIDs = this._interactables.map(eachInteractable => eachInteractable.id);
        if (interactableIDs.some(item => interactableIDs.indexOf(item) !== interactableIDs.lastIndexOf(item))) {
            throw new Error(`Expected all interactable IDs to be unique, but found duplicate interactable ID in ${interactableIDs}`);
        }
        for (const interactable of this._interactables) {
            for (const otherInteractable of this._interactables) {
                if (interactable !== otherInteractable && interactable.overlaps(otherInteractable)) {
                    throw new Error(`Expected interactables not to overlap, but found overlap between ${interactable.id} and ${otherInteractable.id}`);
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90b3duL1Rvd24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUdoQyxPQUFPLE1BQU0sTUFBTSxlQUFlLENBQUM7QUFDbkMsT0FBTyxXQUFXLE1BQU0sb0JBQW9CLENBQUM7QUFDN0MsT0FBTyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFZNUQsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQUVsRCxPQUFPLFdBQVcsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxXQUFXLE1BQU0sZUFBZSxDQUFDO0FBTXhDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sSUFBSTtJQUN2QixJQUFJLFFBQVE7UUFDVixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUksZ0JBQWdCLENBQUMsS0FBYztRQUNqQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQy9CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ2xGLENBQUM7SUFFRCxJQUFJLGdCQUFnQjtRQUNsQixPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztJQUNoQyxDQUFDO0lBRUQsSUFBSSxrQkFBa0I7UUFDcEIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7SUFDbEMsQ0FBQztJQUVELElBQUksT0FBTztRQUNULE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUM3QixDQUFDO0lBRUQsSUFBSSxZQUFZO1FBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFD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
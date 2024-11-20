var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import assert from 'assert';
import { Body, Controller, Delete, Example, Get, Header, Patch, Path, Post, Response, Route, Tags, } from 'tsoa';
import InvalidParametersError from '../lib/InvalidParametersError';
import CoveyTownsStore from '../lib/TownsStore';
let TownsController = class TownsController extends Controller {
    _townsStore = CoveyTownsStore.getInstance();
    async listTowns() {
        return this._townsStore.getTowns();
    }
    async createTown(request) {
        const { townID, townUpdatePassword } = await this._townsStore.createTown(request.friendlyName, request.isPubliclyListed, request.mapFile);
        return {
            townID,
            townUpdatePassword,
        };
    }
    async updateTown(townID, townUpdatePassword, requestBody) {
        const success = this._townsStore.updateTown(townID, townUpdatePassword, requestBody.friendlyName, requestBody.isPubliclyListed);
        if (!success) {
            throw new InvalidParametersError('Invalid password or update values specified');
        }
    }
    async deleteTown(townID, townUpdatePassword) {
        const success = this._townsStore.deleteTown(townID, townUpdatePassword);
        if (!success) {
            throw new InvalidParametersError('Invalid password or update values specified');
        }
    }
    async createConversationArea(townID, sessionToken, requestBody) {
        const town = this._townsStore.getTownByID(townID);
        if (!town?.getPlayerBySessionToken(sessionToken)) {
            throw new InvalidParametersError('Invalid values specified');
        }
        const success = town.addConversationArea(requestBody);
        if (!success) {
            throw new InvalidParametersError('Invalid values specified');
        }
    }
    async createViewingArea(townID, sessionToken, requestBody) {
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            throw new InvalidParametersError('Invalid values specified');
        }
        if (!town?.getPlayerBySessionToken(sessionToken)) {
            throw new InvalidParametersError('Invalid values specified');
        }
        const success = town.addViewingArea(requestBody);
        if (!success) {
            throw new InvalidParametersError('Invalid values specified');
        }
    }
    async createJukeboxArea(townID, sessionToken, requestBody) {
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            throw new InvalidParametersError('Invalid values specified');
        }
        if (!town?.getPlayerBySessionToken(sessionToken)) {
            throw new InvalidParametersError('Invalid values specified');
        }
        const success = town.addJukeboxArea(requestBody);
        if (!success) {
            throw new InvalidParametersError('Invalid values specified');
        }
    }
    async joinTown(socket) {
        const { userName, townID } = socket.handshake.auth;
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            socket.disconnect(true);
            return;
        }
        socket.join(town.townID);
        const newPlayer = await town.addPlayer(userName, socket);
        assert(newPlayer.videoToken);
        socket.emit('initialize', {
            userID: newPlayer.id,
            sessionToken: newPlayer.sessionToken,
            providerVideoToken: newPlayer.videoToken,
            currentPlayers: town.players.map(eachPlayer => eachPlayer.toPlayerModel()),
            friendlyName: town.friendlyName,
            isPubliclyListed: town.isPubliclyListed,
            interactables: town.interactables.map(eachInteractable => eachInteractable.toModel()),
        });
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "listTowns", null);
__decorate([
    Example({ townID: 'stringID', townUpdatePassword: 'secretPassword' }),
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createTown", null);
__decorate([
    Patch('{townID}'),
    Response(400, 'Invalid password or update values specified'),
    __param(0, Path()),
    __param(1, Header('X-CoveyTown-Password')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "updateTown", null);
__decorate([
    Delete('{townID}'),
    Response(400, 'Invalid password or update values specified'),
    __param(0, Path()),
    __param(1, Header('X-CoveyTown-Password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "deleteTown", null);
__decorate([
    Post('{townID}/conversationArea'),
    Response(400, 'Invalid values specified'),
    __param(0, Path()),
    __param(1, Header('X-Session-Token')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createConversationArea", null);
__decorate([
    Post('{townID}/viewingArea'),
    Response(400, 'Invalid values specified'),
    __param(0, Path()),
    __param(1, Header('X-Session-Token')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createViewingArea", null);
__decorate([
    Post('{townID}/jukeboxArea'),
    Response(400, 'Invalid values specified'),
    __param(0, Path()),
    __param(1, Header('X-Session-Token')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createJukeboxArea", null);
TownsController = __decorate([
    Route('towns'),
    Tags('towns')
], TownsController);
export { TownsController };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bnNDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvd24vVG93bnNDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUM1QixPQUFPLEVBQ0wsSUFBSSxFQUNKLFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxFQUNQLEdBQUcsRUFDSCxNQUFNLEVBQ04sS0FBSyxFQUNMLElBQUksRUFDSixJQUFJLEVBQ0osUUFBUSxFQUNSLEtBQUssRUFDTCxJQUFJLEdBQ0wsTUFBTSxNQUFNLENBQUM7QUFHZCxPQUFPLHNCQUFzQixNQUFNLCtCQUErQixDQUFDO0FBQ25FLE9BQU8sZUFBZSxNQUFNLG1CQUFtQixDQUFDO0FBZ0JoRCxJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFnQixTQUFRLFVBQVU7SUFDckMsV0FBVyxHQUFvQixlQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7SUFROUQsS0FBSyxDQUFDLFNBQVM7UUFDcEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFXTSxLQUFLLENBQUMsVUFBVSxDQUFTLE9BQXlCO1FBQ3ZELE1BQU0sRUFBRSxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUN0RSxPQUFPLENBQUMsWUFBWSxFQUNwQixPQUFPLENBQUMsZ0JBQWdCLEVBQ3hCLE9BQU8sQ0FBQyxPQUFPLENBQ2hCLENBQUM7UUFDRixPQUFPO1lBQ0wsTUFBTTtZQUNOLGtCQUFrQjtTQUNuQixDQUFDO0lBQ0osQ0FBQztJQVdNLEtBQUssQ0FBQyxVQUFVLENBQ2IsTUFBYyxFQUNVLGtCQUEwQixFQUNsRCxXQUErQjtRQUV2QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FDekMsTUFBTSxF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
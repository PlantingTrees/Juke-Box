import InteractableArea from './InteractableArea';
export default class JukeboxArea extends InteractableArea {
    _isPlaying;
    _volume;
    _queue;
    _searchlist;
    get volume() {
        return this._volume;
    }
    get isPlaying() {
        if (this._queue.length > 0)
            return true;
        return false;
    }
    get queue() {
        return this._queue;
    }
    constructor({ id, isPlaying, queue, volume, searchList }, coordinates, townEmitter) {
        super(id, coordinates, townEmitter);
        this._isPlaying = isPlaying;
        this._queue = queue;
        this._volume = volume;
        this._searchlist = searchList;
    }
    remove(player) {
        super.remove(player);
        if (this._occupants.length === 0) {
            this._emitAreaChanged();
        }
    }
    updateModel({ isPlaying, queue, volume, searchList }) {
        this._isPlaying = isPlaying;
        this._queue = queue;
        this._volume = volume;
        this._searchlist = searchList;
    }
    toModel() {
        return {
            id: this.id,
            volume: this._volume,
            isPlaying: this._isPlaying,
            queue: this._queue,
            searchList: this._searchlist,
        };
    }
    static fromMapObject(mapObject, townEmitter) {
        const { name, width, height } = mapObject;
        if (!width || !height) {
            throw new Error(`Malformed viewing area ${name}`);
        }
        const rect = { x: mapObject.x, y: mapObject.y, width, height };
        return new JukeboxArea({ isPlaying: false, id: name, volume: 0, queue: [], searchList: [] }, rect, townEmitter);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSnVrZWJveEFyZWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdG93bi9KdWtlYm94QXJlYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxPQUFPLGdCQUFnQixNQUFNLG9CQUFvQixDQUFDO0FBRWxELE1BQU0sQ0FBQyxPQUFPLE9BQU8sV0FBWSxTQUFRLGdCQUFnQjtJQUMvQyxVQUFVLENBQVU7SUFFcEIsT0FBTyxDQUFTO0lBRWhCLE1BQU0sQ0FBUztJQUVmLFdBQVcsQ0FBUztJQUU1QixJQUFXLE1BQU07UUFDZixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUVELElBQVcsU0FBUztRQUNsQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUM7WUFBRSxPQUFPLElBQUksQ0FBQztRQUN4QyxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCxJQUFXLEtBQUs7UUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDckIsQ0FBQztJQVNELFlBQ0UsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFvQixFQUM5RCxXQUF3QixFQUN4QixXQUF3QjtRQUV4QixLQUFLLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUNoQyxDQUFDO0lBVU0sTUFBTSxDQUFDLE1BQWM7UUFDMUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNoQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUN6QjtJQUNILENBQUM7SUFPTSxXQUFXLENBQUMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQW9CO1FBQzNFLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0lBQ2hDLENBQUM7SUFNTSxPQUFPO1FBQ1osT0FBTztZQUNMLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNYLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNwQixTQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDMUIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ2xCLFVBQVUsRUFBRSxJQUFJLENBQUMsV0FBVztTQUM3QixDQUFDO0lBQ0osQ0FBQztJQVFNLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBMEIsRUFBRSxXQUF3QjtRQUM5RSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFDMUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ25EO1FBQ0QsTUFBTSxJQUFJLEdBQWdCLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQzVFLE9BQU8sSUFBSSxXQUFXLENBQ3BCLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLEVBQ3BFLElBQUksRUFDSixXQUFXLENBQ1osQ0FBQztJQUNKLENBQUM7Q0FDRiJ9
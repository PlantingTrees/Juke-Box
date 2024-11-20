import Interactable, { KnownInteractableTypes } from '../Interactable';

export default class JukeboxArea extends Interactable {
  /* this class should set up the default values  from indoors.json on init or when user's hard refresh*/
  /* just need to find the indoor.json to perform some update on the searchQuery */
  private _defaultSearchQueryString?: string;

  private _labelText?: Phaser.GameObjects.Text;

  private _isInteracting = false;

  public get defaultSearchQueryString() {
    if (!this._defaultSearchQueryString) {
      return 'No song Found --my bad :X';
    }
    return this._defaultSearchQueryString;
  }

  addedToScene(): void {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);

    // gets the default searchQuery String from indoor.json i think will check to verify
    this._defaultSearchQueryString = this.getData('searchQuery');
    this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y + this.displayHeight / 2,
      this.name,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );

    this._labelText = this.scene.add.text(
      this.x - this.displayWidth / 2,
      this.y - this.displayHeight / 2,
      `Press Spacebar to Start the Jam!`,
      { color: '#FFFFFF', backgroundColor: '#000000' },
    );
    this._labelText.setVisible(false);
    this.townController.getJukeboxAreaController(this);
    this.setDepth(-1);
  }

  overlap(): void {
    if (!this._labelText) {
      throw new Error('Should not be able to overlap with this interactable before added to scene');
    }
    const location = this.townController.ourPlayer.location;
    this._labelText.setX(location.x);
    this._labelText.setY(location.y);
    this._labelText.setVisible(true);
  }

  overlapExit(): void {
    /* [LINGER EFFECT] this is  creates an effect whrere i can still listen to jukebox even afteer player leaves the area */
    this._labelText?.setVisible(false);
    if (this._isInteracting) {
      this.townController.interactableEmitter.emit('continueInteracting', this);
      this._isInteracting = true;
    }
  }

  interact(): void {
    this._labelText?.setVisible(true);
    this._isInteracting = true;
  }

  getType(): KnownInteractableTypes {
    return 'jukeboxArea';
  }
}

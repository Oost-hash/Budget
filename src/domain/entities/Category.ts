export class Category {
  constructor(
    public readonly id: string,
    private _name: string,
    private _groupId: string | null,
    private _position: number,
  ) {
    this.validateName(_name);
  }

  get name(): string {
    return this._name;
  }

  get groupId(): string | null {
    return this._groupId;
  }

  get position(): number {
    return this._position;
  }

  rename(newName: string): void {
    this.validateName(newName);
    this._name = newName;
  }

  changePosition(newPosition: number): void {
    this._position = newPosition;
  }

  removeFromGroup(): void {
    this._groupId = null;
  }

  assignToGroup(groupId: string): void {
    this._groupId = groupId;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }
  }
}
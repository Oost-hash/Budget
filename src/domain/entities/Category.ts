export class Category {
  constructor(
    public readonly id: string,
    private _name: string,
    private _groupId: string | null,
    private _position: number,
    public readonly createdAt: Date,
    private _updatedAt: Date
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

  get updatedAt(): Date {
    return this._updatedAt;
  }

  rename(newName: string): void {
    this.validateName(newName);
    this._name = newName;
    this._updatedAt = new Date();
  }

  changePosition(newPosition: number): void {
    this._position = newPosition;
    this._updatedAt = new Date();
  }

  removeFromGroup(): void {
    this._groupId = null;
    this._updatedAt = new Date();
  }

  assignToGroup(groupId: string): void {
    this._groupId = groupId;
    this._updatedAt = new Date();
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Category name cannot be empty');
    }
  }
}
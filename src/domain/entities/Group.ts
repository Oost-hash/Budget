export class Group {
  constructor(
    public readonly id: string,
    private _name: string,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {
    this.validateName(_name);
  }

  get name(): string {
    return this._name;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  rename(newName: string): void {
    this.validateName(newName);
    this._name = newName;
    this._updatedAt = new Date();
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Group name cannot be empty');
    }
  }
}
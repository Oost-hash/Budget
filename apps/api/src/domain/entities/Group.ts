export class Group {
  constructor(
    public readonly id: string,
    private _name: string,
  ) {
    this.validateName(_name);
  }

  get name(): string {
    return this._name;
  }

  rename(newName: string): void {
    this.validateName(newName);
    this._name = newName;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Group name cannot be empty');
    }
  }
}
export class UsageError extends Error {
  readonly exitCode = 64;

  constructor(message: string) {
    super(message);
    this.name = 'UsageError';
  }
}

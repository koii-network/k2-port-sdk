export class SomeClass {
  initialization;

  // Implement async constructor
  constructor() {
    this.initialization = this.init();
  }

  async init() {
    await someAsyncCall();
  }

  async fooMethod() {
    await this.initialization();
    // ...some other stuff
  }

  async barMethod() {
    await this.initialization();
    // ...some other stuff
  }
}

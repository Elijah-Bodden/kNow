class eventHandlingMechanism {
  constructor() {
    this.handlerFrame = {};
    this.dispatchWatchers = {};
  }
  onReciept(signalIdentifier, callback) {
    if (!(signalIdentifier in this.handlerFrame)) {
      this.handlerFrame[signalIdentifier] = [];
    }
    this.handlerFrame[signalIdentifier].push(callback);
  }
  dispatch(signalIdentifier, externalDetail) {
    if (this.handlerFrame[signalIdentifier]) {
      this.handlerFrame[signalIdentifier].forEach((method) => {
        method(
          signalIdentifier,
          externalDetail,
          this.handlerFrame[signalIdentifier]
        );
      });
    }
    if (this.dispatchWatchers[signalIdentifier]) {
      this.dispatchWatchers[signalIdentifier].forEach((watcher) => {
        watcher.resolve({
          signalIdentifier: signalIdentifier,
          externalDetail: externalDetail,
        });
      });
      delete this.dispatchWatchers[signalIdentifier];
    }
  }
  forceReject(signalIdentifier, reason) {
    if (this.dispatchWatchers[signalIdentifier]) {
      this.dispatchWatchers[signalIdentifier].forEach((watcher) => {
        watcher.reject(reason);
      });
      delete this.dispatchWatchers[signalIdentifier];
    }
  }
  async acquireExpectedDispatch(dispatchIdentifier, timeout) {
    this.dispatchWatchers[dispatchIdentifier] = this.dispatchWatchers[
      dispatchIdentifier
    ]
      ? this.dispatchWatchers[dispatchIdentifier]
      : [];
    var rejectGeneratedPromise;
    var resolveGeneratedPromise;
    let index =
      this.dispatchWatchers[dispatchIdentifier].push({
        promise: new Promise((resolve, reject) => {
          let hasResolved = false;
          let hasRejected = false;
          resolveGeneratedPromise = async (resolution) => {
            if (hasRejected) return;
            resolve(resolution);
            hasResolved = true;
          };
          rejectGeneratedPromise = async (rejection) => {
            if (hasResolved) return;
            reject(rejection);
            hasRejected = true;
          };
          setTimeout(() => {
            if (!hasResolved)
              reject(
                `Dispatch listener promise for the identifier ${dispatchIdentifier} timed out after ${
                  timeout ?? 100000
                }ms`
              );
          }, timeout ?? 100000);
        }),
        reject: rejectGeneratedPromise,
        resolve: resolveGeneratedPromise,
      }) - 1;
    return await this.dispatchWatchers[dispatchIdentifier][index].promise;
  }
  async flushExpectedDispatches() {
    for (let i in this.dispatchWatchers) {
      for (let j = 0; j < this.dispatchWatchers[i].length; j++) {
        this.dispatchWatchers[i][j].resolve({
          signalIdentifier: i,
          externalDetail: "flushed",
        });
      }
      delete this.dispatchWatchers[i];
    }
  }
}

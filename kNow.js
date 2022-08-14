class kNow {
  constructor(defaultNextTimeout) {
    this.persistentHandlers = {};
    this.dispatchWatchers = {};
    this.defaultNextTimeout = defaultNextTimeout ?? 2147483647
  }
  when(signalIdentifier, callback) {
    if (!(signalIdentifier in this.persistentHandlers)) {
      this.persistentHandlers[signalIdentifier] = [];
    }
    this.persistentHandlers[signalIdentifier].push(callback);
  }
  clearWhen(type) {
    if (type) {
      this.persistentHandlers[type] = [];
      return;
    }
    this.persistentHandlers = {};
  }
  dispatch(signalIdentifier, externalDetail) {
    if (this.persistentHandlers[signalIdentifier]) {
      this.persistentHandlers[signalIdentifier].forEach((method) => method(externalDetail));
    }
    if (this.dispatchWatchers[signalIdentifier]) {
      this.dispatchWatchers[signalIdentifier].forEach((watcher) => watcher.resolve({externalDetail: externalDetail, signalIdentifier}));
      delete this.dispatchWatchers[signalIdentifier];
    }
  }
  forceReject(signalIdentifier, reason) {
    if (!this.dispatchWatchers[signalIdentifier]) {
      this.dispatchWatchers[signalIdentifier].forEach((watcher) => watcher.reject(reason));
      delete this.dispatchWatchers[signalIdentifier];
    }
  }
  async next(dispatchIdentifier, timeout) {
    if (!this.dispatchWatchers[dispatchIdentifier]) this.dispatchWatchers[dispatchIdentifier] = []
    var rejectGeneratedPromise;
    var resolveGeneratedPromise;
    let index =
      this.dispatchWatchers[dispatchIdentifier].push({
        promise: new Promise((resolve, reject) => {
          let spent = false
          resolveGeneratedPromise = async (resolution) => {
            if (spent) return;
            resolve(resolution);
            spent = true;
          };
          rejectGeneratedPromise = async (rejection) => {
            if (spent) return;
            reject(rejection);
            spent = true;
          };
          setTimeout(() => {
            if (spent) return;
            reject(`Listener timed out after ${timeout ?? this.defaultNextTimeout}ms`);
          }, timeout ?? this.defaultNextTimeout);
        }),
        reject: rejectGeneratedPromise,
        resolve: resolveGeneratedPromise,
      }) - 1;
    return await this.dispatchWatchers[dispatchIdentifier][index].promise;
  }
  clearNext(type, method) {
    var flushFunction = (method === "resolve" || method === "reject") ? method==="resolve" ? this.dispatch : this.forceReject : this.dispatch
    for (i in this.dispatchWatchers) {
      flushFunction(i, "flushed")
    }
  }
}

class kNow {
  constructor(defaultNextTimeout) {
    this.persistentHandlers = {};
    this.dispatchWatchers = {};
    this.defaultNextTimeout =
      defaultNextTimeout !== undefined && defaultNextTimeout !== null
        ? defaultNextTimeout
        : 2147483647;
    this.allowPromises = "Promise" in window;
  }
  when(signalIdentifier, callback) {
    if (!(signalIdentifier in this.persistentHandlers)) {
      this.persistentHandlers[signalIdentifier] = [];
    }
    var instanceID = Math.random().toString().slice(2);
    this.persistentHandlers[signalIdentifier].push({
      method: callback,
      instanceID
    });
    return {id : instanceID};
  }
  clearWhen(clearParameter) {
    if (!clearParameter) {
      this.persistentHandlers = {};
      return;
    }
    if (clearParameter.id) {
      var loc = Object.keys(this.persistentHandlers).reduce(
        (last, current, index) => {
          var includedIndex = (this.persistentHandlers[current].reduce((last, entry, index) => entry.instanceID===clearParameter.id ? index : last, false))
          return includedIndex!==false ? [current, includedIndex] : last
        },
        null
      );
      if (loc) {
        this.persistentHandlers[loc[0]].splice(loc[1], 1)
      }
      return
    }
    if (typeof clearParameter != "string" && typeof clearParameter != "number") return
    this.persistentHandlers[clearParameter] = [];
  }
  dispatch(signalIdentifier, externalDetail) {
    if (this.persistentHandlers[signalIdentifier]) {
      this.persistentHandlers[signalIdentifier].forEach((member) =>
        member.method(externalDetail)
      );
    }
    if (this.dispatchWatchers[signalIdentifier]) {
      this.dispatchWatchers[signalIdentifier].forEach((watcher) =>
        watcher.resolve({ externalDetail: externalDetail, signalIdentifier })
      );
      delete this.dispatchWatchers[signalIdentifier];
    }
  }
  forceReject(signalIdentifier, reason) {
    if (this.dispatchWatchers[signalIdentifier]) {
      this.dispatchWatchers[signalIdentifier].forEach((watcher) =>
        watcher.reject(reason)
      );
      delete this.dispatchWatchers[signalIdentifier];
    }
  }
  async next(dispatchIdentifier, timeout) {
    if (!this.allowPromises)
      throw new Error(
        "The current environment doesn't support promises; cannot attatch 'next'-style listener."
      );
    if (!this.dispatchWatchers[dispatchIdentifier])
      this.dispatchWatchers[dispatchIdentifier] = [];
    var rejectGeneratedPromise;
    var resolveGeneratedPromise;
    var index =
      this.dispatchWatchers[dispatchIdentifier].push({
        promise: new Promise((resolve, reject) => {
          var spent = false;
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
          setTimeout(
            () => {
              if (spent) return;
              reject(
                `Listener timed out after ${
                  timeout !== undefined && timeout !== null
                    ? timeout
                    : this.defaultNextTimeout
                }ms`
              );
            },
            timeout !== undefined && timeout !== null
              ? timeout
              : this.defaultNextTimeout
          );
        }),
        reject: rejectGeneratedPromise,
        resolve: resolveGeneratedPromise
      }) - 1;
    return await this.dispatchWatchers[dispatchIdentifier][index].promise;
  }
  clearNext(...types) {
    for (var i of types!="" ? types : Object.keys(this.dispatchWatchers)) {
      this.forceReject(i, "flushed")
    }
  }
  async in(interval) {
    try {await this.next("&&IN_RESERVED_NEXT&&", interval)} catch {}
  }
  async clearIn() {
    this.clearNext("&&IN_RESERVED_NEXT&&")
  }
}

export default kNow;

export const browserApi = globalThis.browser ?? globalThis.chrome ?? null;

export const callApi = (target, method, ...args) => {
  if (!target?.[method]) {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve, reject) => {
    try {
      const result = target[method](...args, value => {
        const error = browserApi?.runtime?.lastError;
        error ? reject(new Error(error.message)) : resolve(value);
      });

      if (result?.then) {
        result.then(resolve, reject);
      }
    } catch (error) {
      reject(error);
    }
  });
};

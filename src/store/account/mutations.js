export const setLoadingWallet = (state, wallet) => {
  state.loading = wallet;
};

export const setAccountName = (state, accountName) => {
  state.accountName = accountName;
};

export const setAutoLogin = (state, status) => {
  state.autoLogin = status;
};

export const setPool = (state, pool = undefined) => {
  debugger;
  if (!pool) {
    pool = "0.0000 TLOS";
  }
  state.pool = pool;
};

export const setTime = (state, time = undefined) => {
  debugger;
  if (!time) {
    time = 0;
  }
  state.time = time;
};


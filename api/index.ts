export const initFetchFromApi = (onLoggedOut: ()=>void)=> async ({
  path,
  method = "GET",
  body,
}: {
  path: string;
  method: string;
  body: any
}) =>{
  const res = await fetch("/api/" + path, {
    method,
    body: JSON.stringify(body),
    headers: {
        accept: "application/json",
        content: "application/json"
    },
    credentials:"same-origin"
  });

  const txt = await res.json()

  if (txt?.error && txt?.error ==="not authorised") {
    onLoggedOut();
  }
  
  return txt;
}
export const Api = (onLoggedOut: ()=>void) =>{
  
  const fetchFromApi = initFetchFromApi(onLoggedOut)
  return {
    User: {
      login: ({
        username,
        password,
      }: {
        username: string;
        password: string;
      }) => {
        return fetchFromApi({
          path: "auth/login",
          method: "POST",
          body: {
            username,
            password,
          },
        });
      },
      checkToken: () => {
        return fetchFromApi({
          path: "auth/checkToken",
          method: "POST",
          body: {},
        });
      },
    },
    Coldkeys: {
      create: ({ name, password }: { name: string; password: string }) => {
        return fetchFromApi({
          path: "dashboard/coldkeys/create",
          method: "POST",
          body: {
            name,
            password,
          },
        });
      },
      regen: ({
        name,
        password,
        mnemonic,
      }: {
        name: string;
        password: string;
        mnemonic: string;
      }) => {
        return fetchFromApi({
          path: "dashboard/coldkeys/regen",
          method: "POST",
          body: {
            name,
            password,
            mnemonic,
          },
        });
      },
      getMultiple: () => {
        return fetchFromApi({
          path: "dashboard/coldkeys",
          method: "POST",
          body: {},
        });
      },
    },
    Hotkeys: {
      create: ({ name, coldkeyId }: { name: string; coldkeyId: number }) => {
        return fetchFromApi({
          path: "dashboard/hotkeys/create",
          method: "POST",
          body: {
            name,
            coldkeyId,
          },
        });
      },
      regen: ({
        name,
        coldkeyId,
        mnemonic,
      }: {
        name: string;
        coldkeyId: number;
        mnemonic: string;
      }) => {
        return fetchFromApi({
          path: "dashboard/hotkeys/regen",
          method: "POST",
          body: {
            name,
            coldkeyId,
            mnemonic,
          },
        });
      },
      getMultiple: () => {
        return fetchFromApi({
          path: "dashboard/hotkeys",
          method: "POST",
          body: {},
        });
      },
    },
    Miners: {
      create: ({
        name,
        hotkeyId,
        model,
        autocast,
        port,
        cudaDevice,
        useCuda,
        subtensorNetwork,
        subtensorIp,
        status,
      }: {
        name: string;
        hotkeyId: number;
        status: number;
        model: string;
        autocast: boolean;
        port: string;
        cudaDevice: string;
        useCuda: boolean;
        subtensorNetwork: string;
        subtensorIp?: string;
      }) => {
        return fetchFromApi({
          path: "dashboard/miners/create",
          method: "POST",
          body: {
            name,
            hotkeyId,
            model,
            autocast,
            port,
            cudaDevice,
            useCuda,
            subtensorNetwork,
            subtensorIp,
            status,
          },
        });
      },
      logs: ({ name }: { name: string }) => {
        return fetchFromApi({
          path: "dashboard/miners/logs",
          method: "POST",
          body: {
            name,
          },
        });
      },
      delete: ({ name }: { name: string }) => {
        return fetchFromApi({
          path: "dashboard/miners/delete",
          method: "POST",
          body: {
            name,
          },
        });
      },
      restart: ({ name }: { name: string }) => {
        return fetchFromApi({
          path: "dashboard/miners/restart",
          method: "POST",
          body: {
            name,
          },
        });
      },
      start: ({ name }: { name: string }) => {
        return fetchFromApi({
          path: "dashboard/miners/start",
          method: "POST",
          body: {
            name,
          },
        });
      },
      stop: ({ name }: { name: string }) => {
        return fetchFromApi({
          path: "dashboard/miners/stop",
          method: "POST",
          body: {
            name,
          },
        });
      },
      getMultiple: () => {
        return fetchFromApi({
          path: "dashboard/miners",
          method: "POST",
          body: {},
        });
      },
    },
  };};
import * as React from "react";

import { Layout } from "../../components";

import { NextPage } from "next";

import { useRouter } from "next/router";
import { Button, CogIcon, CrossIcon, DotIcon, IconButton, Menu, MenuIcon, PlayIcon, Popover, Position, ResetIcon, SelectField, SendToIcon, SideSheet, Spinner, StopIcon, Switch, Table, TableHead, TextInputField } from "evergreen-ui";
import { CopyBlock, dracula } from "react-code-blocks";

import { ColdkeyContext } from "context";
import { useApi, useColdkeys, useHotkeys, useMinerData } from "hooks";

const MinersPage: NextPage = () => {
  const Api = useApi();

  const router = useRouter();
  const {minerData,setMinerData} = useMinerData()
  const {hotkeys,setHotkeys} = useHotkeys()
  const {coldkeys,setColdkeys} = useColdkeys()
  const [didInit, setDidInit] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [coldkeyId, setColdkeyId] = React.useState<number|null>(null);
  const [hotkeyId, setHotkeyId] = React.useState<number|null>(null);
  const [autocast, setAutocast] = React.useState(true);
  const [useCuda, setUseCuda] = React.useState(true);
  const [name, setName] = React.useState("");
  const [model, setModel] = React.useState("EleutherAI/gpt-neo-1.3B");
  const [cudaDevice, setCudaDevice] = React.useState("0");
  const [port, setPort] = React.useState("8081");
  const [subtensorNetwork, serSubtensorNetwork] = React.useState("nakamoto");
  const [subtensorIp, setSubtensorIp] = React.useState("");
  const [fetchedLogs, setFetchedLogs] = React.useState("");

  const [createPanelOpen, setCreatePanelOpen] = React.useState(false);
  const [logPanelOpen, setLogPanelOpen] = React.useState(false);



  const getColdkeys = async () => {
    setLoading(true)
    const res = await Api.Coldkeys.getMultiple();
    if(res.error){
      return;
    }
    setColdkeys(res.coldkeys)
    setLoading(false)
  }
  React.useEffect(() => {

    getColdkeys()
  }, []);
  const getHotkeys = async () => {
    setLoading(true)
    const res = await Api.Hotkeys.getMultiple();
    if (res.error) {
      return;
    }
    setHotkeys(res.hotkeys)
    setLoading(false)
  }
  React.useEffect(() => {

    getColdkeys()
    getHotkeys()
    getMiners();
  }, []);
  const getMiners = async () => {
    setLoading(true)
    const res = await Api.Miners.getMultiple();
    if (res.error) {
      return;
    }
    setMinerData(res.miners)
    setLoading(false)
  }
 

  const createMiner = async () => {
    if (coldkeyId && hotkeyId && name&&
model&&
port&&
cudaDevice&&
subtensorNetwork) {
      setLoading(true);
      const res = await Api.Miners.create({ name, hotkeyId,
model,
port,
cudaDevice,
subtensorNetwork, autocast,
useCuda,
status:1,
subtensorIp});
      if (res.error) {
        return;
      }
    getMiners();
    }
  };

  const _start =({name}:{name:string})=>async () => {
    const res = await Api.Miners.start({name})
    getMiners()
  };
  const _restart =({name}:{name:string})=>async () => {
    const res = await Api.Miners.restart({name})
    getMiners()
  };
  const _openLogs =({name}:{name:string})=>async () => {
    setFetchedLogs("");
    setLogPanelOpen(true)

    const res = await Api.Miners.logs({ name });
    setFetchedLogs(res?.logs|| "")

  };
  const _stop =({name}:{name:string})=>async () => {
    const res = await Api.Miners.stop({name})
    getMiners()
  };
  const _delete =({name}:{name:string})=>async () => {
    const res = await Api.Miners.delete({name})
    getMiners()
  };

  return (
    <Layout withNav>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>Miners</h3>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Button intent="success" onClick={() => setCreatePanelOpen(true)}>
            Add
          </Button>
        </div>
      </div>
      <Table>
        <Table.Head>
          <Table.TextHeaderCell>NAME</Table.TextHeaderCell>
          <Table.TextHeaderCell>COLDKEY</Table.TextHeaderCell>
          <Table.TextHeaderCell>HOTKEY</Table.TextHeaderCell>
          <Table.TextHeaderCell></Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {minerData.length ? (
            minerData.map((h) => (
              // @ts-ignore
              <Table.Row key={h?.id}>
                <Table.TextCell>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {/* @ts-ignore */}

                    {h.status === 1 ? (
                      <div
                        style={{
                          marginRight: 5,
                          borderRadius: 10,
                          height: 10,
                          width: 10,
                          backgroundColor: "#0F0",
                        }}
                      ></div>
                    ) : null}
                    {h.name}
                  </div>
                </Table.TextCell>
                <Table.TextCell>
                  {/* @ts-ignore */}

                  {coldkeys?.find((c) => c.id === h?.Hotkey?.ColdkeyId)?.name}
                </Table.TextCell>
                {/* @ts-ignore */}

                <Table.TextCell>{h?.Hotkey?.name}</Table.TextCell>
                <Table.TextCell>
                  <Popover
                    position={Position.BOTTOM_LEFT}
                    content={
                      <Menu>
                        <Menu.Group>
                          <Menu.Item
                            icon={PlayIcon}
                            intent="success"
                            onClick={_start({ name: h.name })}
                          >
                            Start
                          </Menu.Item>
                          <Menu.Item
                            icon={ResetIcon}
                            onClick={_restart({ name: h.name })}
                          >
                            Restart
                          </Menu.Item>
                          <Menu.Item
                            icon={MenuIcon}
                            onClick={_openLogs({ name: h.name })}
                          >
                            Logs
                          </Menu.Item>
                          <Menu.Item
                            icon={StopIcon}
                            intent="danger"
                            onClick={_stop({ name: h.name })}
                          >
                            Stop
                          </Menu.Item>
                        </Menu.Group>
                        <Menu.Group>
                          <Menu.Item
                            icon={CrossIcon}
                            intent="danger"
                            onClick={_delete({ name: h.name })}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Group>
                      </Menu>
                    }
                  >
                    <IconButton icon={MenuIcon}></IconButton>
                  </Popover>
                </Table.TextCell>
              </Table.Row>
            ))
          ) : (
            <div
              style={{
                display: "flex",
                padding: 60,
                justifyContent: "center",
                opacity: 0.5,
                alignItems: "center",
              }}
            >
              {loading ? (
                <div
                  style={{
                    padding: 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Spinner />
                </div>
              ) : (
                "No data"
              )}
            </div>
          )}
        </Table.Body>
      </Table>

      <SideSheet
        isShown={createPanelOpen}
        preventBodyScrolling
        onCloseComplete={() => setCreatePanelOpen(false)}
      >
        <div style={{ padding: 20 }}>
          <h1>Create</h1>
          <br />
          <br />
          {loading ? (
            <div
              style={{
                padding: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Spinner />
            </div>
          ) : (
            <>
              <SelectField
                label="Coldkey"
                value={coldkeyId + ""}
                onChange={
                  // @ts-ignore
                  (e) => setColdkeyId(e.target.value || null)
                }
              >
                <option value="">Choose a coldkey</option>
                {coldkeys.map((c) => {
                  //@ts-ignore
                  return <option value={c.id}>{c.name}</option>;
                })}
              </SelectField>
              {coldkeyId ? (
                <SelectField
                  label="Hotkey"
                  value={hotkeyId + ""}
                  onChange={
                    // @ts-ignore
                    (e) => setHotkeyId(e.target.value)
                  }
                >
                  <option>Choose a coldkey</option>
                  {hotkeys
                    // @ts-ignore
                    .filter((h) => h?.ColdkeyId == parseInt(coldkeyId + ""))
                    .map((h) => {
                      //@ts-ignore
                      return <option value={h.id}>{h.name}</option>;
                    })}
                </SelectField>
              ) : null}
              <TextInputField
                label="Name"
                value={name}
                onChange={({ target: { value } }: any) => setName(value)}
              />
              <TextInputField
                label="Model"
                value={model}
                onChange={({ target: { value } }: any) => setModel(value)}
              />
              <TextInputField
                label="Port"
                value={port}
                onChange={({ target: { value } }: any) => setPort(value)}
              />
              <label>
                <p>Do you want to use Autocast?</p>
                <Switch
                  checked={autocast}
                  onChange={
                    // @ts-ignore
                    (e) => setAutocast(e.target.checked)
                  }
                ></Switch>
                <br />
              </label>
              <label>
                <p>Do you want to use a GPU?</p>
                <Switch
                  checked={useCuda}
                  onChange={
                    // @ts-ignore
                    (e) => setUseCuda(e.target.checked)
                  }
                ></Switch>
                <br />
              </label>
              {useCuda ? (
                <TextInputField
                  label="Cuda device"
                  placeholder="For example 0"
                  value={cudaDevice}
                  onChange={(e: any) => setCudaDevice(e.target.value)}
                />
              ) : null}
              <label>
                <p>Do you want to use a Local Subtensor?</p>
                <Switch
                  checked={subtensorNetwork === "local"}
                  onChange={
                    // @ts-ignore
                    (e) =>
                      serSubtensorNetwork(
                        e.target.checked ? "local" : "nakamoto"
                      )
                  }
                ></Switch>
                <br />
              </label>
              {subtensorNetwork === "local" ? (
                <TextInputField
                  label="Subtensor IP (without port number)"
                  placeholder="For example 127.0.0.1"
                  value={subtensorIp}
                  onChange={(e: any) => setSubtensorIp(e.target.value)}
                />
              ) : null}
              <br />
              <br />
              <p>
                If you click the following button then I think you might start
                registering a hotkey and to run core_server with an if the
                hotkey is or gets registered
              </p>
              <br />
              <br />
              <Button intent="success" onClick={createMiner}>
                Submit and try to start
              </Button>
              <br />
              <br />
            </>
          )}
        </div>
      </SideSheet>
      <SideSheet
        isShown={logPanelOpen}
        preventBodyScrolling
        onCloseComplete={() => setLogPanelOpen(false)}
      >
        <div style={{ padding: 20 }}>
          <h1>Logs</h1>
          <br />
          <br />
          {fetchedLogs ? (
            <CopyBlock
              text={fetchedLogs}
              language={"bash"}
              showLineNumbers={false}
              wrapLines
              theme={dracula}
            />
          ) : (
            <div
              style={{
                padding: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Spinner />
            </div>
          )}
        </div>
      </SideSheet>
    </Layout>
  );
};

export default MinersPage;

import * as React from "react";

import { FormikTextInput, Layout } from "../../components";

import { NextPage } from "next";

import { useRouter } from "next/router";
import { Alert, Button, CogIcon, CrossIcon, DotIcon, FormField, IconButton, Menu, MenuIcon, PlayIcon, Popover, Position, ResetIcon, SelectField, SelectMenu, SendToIcon, SideSheet, Spinner, StopIcon, Switch, Table, TableHead } from "evergreen-ui";
import { CopyBlock, dracula } from "react-code-blocks";
import { object, string, number, date, InferType } from "yup";
import * as yup from "yup";

import { ColdkeyContext } from "context";
import { useApi, useColdkeys, useHotkeys, useMinerData } from "hooks";
import { useFormik } from "formik";

const MinersPage: NextPage = () => {
  const Api = useApi();

  const router = useRouter();
  const {minerData,setMinerData} = useMinerData()
  const {hotkeys,setHotkeys} = useHotkeys()
  const {coldkeys,setColdkeys} = useColdkeys()
  const [didInit, setDidInit] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
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
 

  const createMiner = async ({
    coldkeyId,
    hotkeyIds,
    name,
    model,
    port,
    cudaDevice,
    subtensorNetwork,
    subtensorIp,
    useCuda,
    autocast,

  }: {
    coldkeyId: number;
    hotkeyIds: number;
    name: string;
    model: string;
    port: string;
    autocast?: boolean;
    useCuda?: boolean;
    cudaDevice?: number;
    subtensorNetwork: string;
    subtensorIp: string;
  }) => {
    setLoading(true);
    const res = await Api.Miners.create({
      name,
      hotkeyIds,
      model,
      port,
      cudaDevice,
      subtensorNetwork,
      autocast,
      useCuda,
      status: 1,
      subtensorIp,
    });
    if (res.error) {
      return;
    }
    getMiners();
    setCreatePanelOpen(false)
    formik.resetForm()
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


  const formik = useFormik({
    initialValues: {
      name: "",
      coldkeyId: null,
      hotkeyIds: [],
      model: "EleutherAI/gpt-neo-1.3B",
      port: "8073",
      cudaDevice: 0,
      subtensorNetwork: "nakamoto",
      subtensorIp: "",
      useCuda: true,
      autocast: true,
    },
    validationSchema: object({
      name: string()
        .min(1)
        .test("no_duplicate_name", "is not unique", (value) => {
          return (
            !value || minerData?.map((md) => md.name).indexOf(value) === -1
          );
        })
        .required(),
      hotkeyIds: yup.array().of(number()).min(1, "at least 1 hotkey must be selected").required(),
      coldkeyId: number().required(),
      cudaDevice: number().optional(),
      model: string().required(),
      port: string().required(),
      subtensorNetwork: string().required(),
      subtensorIp: string().optional(),
      useCuda: yup.bool().required(),
      autocast: yup.bool().required(),
    }),
    onSubmit: async ({ 
      name, 
      hotkeyIds,
      coldkeyId,
      cudaDevice,
      model,
      port,
      subtensorNetwork,
      subtensorIp,
      useCuda,
      autocast,
    }) => {
      // @ts-ignore
      createMiner({name, hotkeyIds,coldkeyId,
        cudaDevice,
        model,
        port,
        subtensorNetwork,
        subtensorIp,
        useCuda,
        autocast,
      });
    },
  });

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
          <Table.TextHeaderCell>HOTKEY(S)</Table.TextHeaderCell>
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

                  {
                    coldkeys?.find(
                      (c) =>
                        h?.Hotkeys?.length && c.id === h?.Hotkeys[0]?.ColdkeyId
                    )?.name
                  }
                </Table.TextCell>
                {/* @ts-ignore */}

                <Table.TextCell>
                  {h?.Hotkeys?.map((h) => h.name).join(",")}
                </Table.TextCell>
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
                value={formik.values.coldkeyId + ""}
                isInvalid={!!formik.errors.coldkeyId}
                validationMessage={formik.errors.coldkeyId}
                onChange={
                  // @ts-ignore
                  (e) => {
                    formik.setFieldValue("hotkeyIds", []);
                    formik.setFieldValue("coldkeyId", e.target.value || null);
                  }
                }
              >
                <option value="">Choose a coldkey</option>
                {coldkeys.map((c) => {
                  //@ts-ignore
                  return <option value={c.id}>{c.name}</option>;
                })}
              </SelectField>
              {formik.values.hotkeyIds.length > 1 ? (
                <Alert intent="warning" marginBottom={32}>
                  Using multiple hotkeys in 1 PM2 process might be risky
                </Alert>
              ) : null}
              <FormField
                label={"What hotkey(s) do you want to use"}
                isInvalid={!!formik.errors.hotkeyIds}
                validationMessage={formik.errors.hotkeyIds}
              >
                <SelectMenu
                  // disabled={!formik.values.coldkeyId}
                  options={hotkeys
                    // @ts-ignore
                    .filter(
                      (h) =>
                        // @ts-ignore
                        h?.ColdkeyId == parseInt(formik.values.coldkeyId + "")
                    )
                    .map((h) => {
                      //@ts-ignore
                      return { label: h.name, value: h.id };
                    })}
                  title="Hotkeys"
                  selected={formik.values.hotkeyIds}
                  onSelect={
                    // @ts-ignore
                    (item) =>
                      formik.setFieldValue("hotkeyIds", [
                        ...formik.values.hotkeyIds,
                        item.value,
                      ])
                  }
                  onDeselect={
                    // @ts-ignore
                    (item) => {
                      formik.setFieldValue(
                        "hotkeyIds",
                        formik.values.hotkeyIds.filter((h) => h !== item.value)
                      );
                    }
                  }
                >
                  <Button>Choose hotkey(s)</Button>
                </SelectMenu>
              </FormField>

              <br />
              <br />
              <FormikTextInput label="Name" name="name" formik={formik} />
              <FormikTextInput label="Model" name="model" formik={formik} />
              {process.env.NEXT_PUBLIC_IS_POD ? (
                <SelectField
                  label="Port"
                  value={formik.values.port + ""}
                  isInvalid={!!formik.errors.port}
                  validationMessage={formik.errors.port}
                  onChange={
                    // @ts-ignore
                    (e) => {
                      formik.setFieldValue("port", e.target.value || null);
                    }
                  }
                >
                  <option value="">Choose a port</option>
                  {[0,1,2,3,4,5,6,7,8,9].map((p) => {
                    //@ts-ignore
                    return (
                      <option
                        value={`$RUNPOD_TCP_PORT_7000${p}`}
                      >{`$RUNPOD_TCP_PORT_7000${p}`}</option>
                    );
                  })}
                </SelectField>
              ) : (
                <FormikTextInput label="Port" name="port" formik={formik} />
              )}
              {formik.values.hotkeyIds.length > 1 ? (
                <Alert intent="warning" marginBottom={32}>
                  If you use multiple hotkeys on 1 PM2 process then you can
                  expect that the script might try to use the ports that follow
                  the port you entered above this warning.
                </Alert>
              ) : null}

              <label>
                <p>Do you want to use Autocast?</p>
                <Switch
                  isInvalid={!!formik.errors.autocast}
                  checked={formik.values.autocast}
                  onChange={
                    // @ts-ignore
                    (e) => formik.setFieldValue("autocast", e.target.checked)
                  }
                ></Switch>
                <br />
              </label>
              <label>
                <p>Do you want to use a GPU?</p>
                <Switch
                  isInvalid={!!formik.errors.useCuda}
                  checked={formik.values.useCuda}
                  onChange={
                    // @ts-ignore
                    (e) => formik.setFieldValue("useCuda", e.target.checked)
                  }
                ></Switch>
                <br />
              </label>
              {formik.values.useCuda ? (
                <FormikTextInput
                  formik={formik}
                  name="cudaDevice"
                  label="Cuda device"
                  placeholder="For example 0"
                />
              ) : null}
              <label>
                <p>Do you want to use Testnet?</p>
                <Switch
                  checked={formik.values.subtensorNetwork === "nobunaga"}
                  onChange={
                    // @ts-ignore
                    (e) =>
                      formik.setFieldValue(
                        "subtensorNetwork",
                        e.target.checked ? "nobunaga" : "nakamoto"
                      )
                  }
                ></Switch>
                <br />
              </label>
              {formik.values.subtensorNetwork !== "nobunaga" ? (
                <label>
                  <p>Do you want to use a Local Subtensor?</p>
                  <Switch
                    checked={formik.values.subtensorNetwork === "local"}
                    onChange={
                      // @ts-ignore
                      (e) =>
                        formik.setFieldValue(
                          "subtensorNetwork",
                          e.target.checked ? "local" : "nakamoto"
                        )
                    }
                  ></Switch>
                  <br />
                </label>
              ) : null}
              {formik.values.subtensorNetwork === "local" ? (
                <FormikTextInput
                  formik={formik}
                  name="subtensorIp"
                  label="Subtensor IP (without port number)"
                  placeholder="For example 127.0.0.1"
                />
              ) : null}
              <br />
              <br />
              <p>
                If you click the following button then I think you might start
                registering hotkey(s) and to run core_server(s) if the hotkey(s)
                are or get registered
              </p>
              <br />
              <br />
              <Button intent="success" onClick={formik.submitForm}>
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

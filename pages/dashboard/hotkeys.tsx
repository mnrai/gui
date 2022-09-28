import * as React from "react";

import { Layout } from "../../components";

import { NextPage } from "next";

import { useRouter } from "next/router";
import { Button, SelectField, SideSheet, Spinner, Table, TableHead, TextInputField } from "evergreen-ui";

import { ColdkeyContext } from "context";
import { useApi, useColdkeys, useHotkeys } from "hooks";

const HotkeysPage: NextPage = () => {
  const Api = useApi();

  const router = useRouter();
  const {hotkeys,setHotkeys} = useHotkeys()
  const {coldkeys,setColdkeys} = useColdkeys()
  const [didInit, setDidInit] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [coldkeyId, setColdkeyId] = React.useState<number|null>(null);
  const [name, setName] = React.useState("");
  const [regenMnemonic, setRegenMnemonic] = React.useState("");
  const [createPanelOpen, setCreatePanelOpen] = React.useState(false);
  const [regenPanelOpen, setRegenPanelOpen] = React.useState(false);
  const [mmnemonic, setMnemonic] = React.useState("");

  const getColdkeys = async () => {
    setLoading(true)
    const res = await Api.Coldkeys.getMultiple();
    if (res.error) {
      return;
    }
    setColdkeys(res.coldkeys)
    setLoading(false)
  }

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
  }, []);


  const createHotkey = async () => {
    if (coldkeyId) {
      setLoading(true);
      const res = await Api.Hotkeys.create({ name, coldkeyId });
      if (res.error) {
        return;
      }
      setMnemonic(res.mnemonic.replace("btcli regen_hotkey --mnemonic ", ""));
      getHotkeys();
    }
  };
  const regenHotkey = async () => {
    if (coldkeyId) {
      setLoading(true);
      const res = await Api.Hotkeys.regen({
        name,
        coldkeyId,
        mnemonic: regenMnemonic,
      });
      setRegenPanelOpen(false);
      setRegenMnemonic("");
      setName("");
      setColdkeyId(null);
      getHotkeys();
    }
  }

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
        <h3>Hotkeys</h3>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Button
            style={{ marginRight: 20 }}
            onClick={() => setRegenPanelOpen(true)}
          >
            Regen Hotkey
          </Button>
          <Button intent="success" onClick={() => setCreatePanelOpen(true)}>
            Add Hotkey
          </Button>
        </div>
      </div>
      <Table>
        <Table.Head>
          <Table.TextHeaderCell>NAME</Table.TextHeaderCell>
          <Table.TextHeaderCell>COLDKEY</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {hotkeys.length ? (
            hotkeys.map((h) => (
                // @ts-ignore 
              <Table.Row key={h?.id}>
                <Table.TextCell>{h.name}</Table.TextCell>
                {/* @ts-ignore */}
                <Table.TextCell>{h?.Coldkey?.name}</Table.TextCell>
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
                "No hotkeys"
              )}
            </div>
          )}
        </Table.Body>
      </Table>
      <SideSheet
        isShown={regenPanelOpen}
        preventBodyScrolling
        onCloseComplete={() => setRegenPanelOpen(false)}
      >
        <div style={{ padding: 20 }}>
          <h1>Regen Hotkey</h1>
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
                value={coldkeyId+""}
                onChange={
                  // @ts-ignore
                  (e) => setColdkeyId(e.target.value)
                }
              >
                <option>Choose a coldkey</option>

                {coldkeys.map((c) => {
                  //@ts-ignore
                  return <option value={c.id}>{c.name}</option>;
                })}
              </SelectField>
              <TextInputField
                label="Name"
                value={name}
                onChange={({ target: { value } }: any) => setName(value)}
              />

              <TextInputField
                label="Mnemonic"
                value={regenMnemonic}
                onChange={({ target: { value } }: any) =>
                  setRegenMnemonic(value)
                }
              />

              <Button intent="success" onClick={regenHotkey}>
                Submit
              </Button>
            </>
          )}
        </div>
      </SideSheet>
      <SideSheet
        isShown={createPanelOpen}
        preventBodyScrolling
        onCloseComplete={() => setCreatePanelOpen(false)}
      >
        <div style={{ padding: 20 }}>
          <h1>Create Hotkey</h1>
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
                value={coldkeyId+""}
                onChange={
                  // @ts-ignore
                  (e) => setColdkeyId(e.target.value)
                }
              >
                <option>Choose a coldkey</option>
                {coldkeys.map((c) => {
                  //@ts-ignore
                  return <option value={c.id}>{c.name}</option>;
                })}
              </SelectField>
              <TextInputField
                label="Name"
                value={name}
                onChange={({ target: { value } }: any) => setName(value)}
              />

              {mmnemonic ? (
                <>
                  <h2 className="danger">
                    Please write down the following mnemonic: {mmnemonic}
                  </h2>
                  <br />
                  <br />
                  <Button
                    intent="danger"
                    onClick={() => {
                      setCreatePanelOpen(false);
                      setMnemonic("");
                      setName("");
                      setColdkeyId(null);
                    }}
                  >
                    The mnemonic is written down
                  </Button>
                </>
              ) : (
                <Button intent="success" onClick={createHotkey}>
                  Submit
                </Button>
              )}
            </>
          )}
        </div>
      </SideSheet>
    </Layout>
  );
};

export default HotkeysPage;

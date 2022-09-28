import * as React from "react";

import { Layout } from "../../components";

import { NextPage } from "next";

import { useRouter } from "next/router";
import { Button, SideSheet, Spinner, Table, TableHead, TextInputField } from "evergreen-ui";

import { ColdkeyContext } from "context";
import { useApi, useHotkeys } from "hooks";

const ColdkeysPAge: NextPage = () => {
  const Api = useApi();

  const router = useRouter();
  const {data:coldkeys, setData: setColdkeys} = React.useContext(ColdkeyContext)
  const {hotkeys, setHotkeys} = useHotkeys()
  const [didInit, setDidInit] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
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
    setHotkeys(res.hotkeys);
    setLoading(false)
  }
  React.useEffect(() => {

    getHotkeys();
    getColdkeys()
  }, []);


  const createColdkey = async () => {
    setLoading(true)
    const res = await Api.Coldkeys.create({name, password});
    setMnemonic(res.mnemonic.replace("btcli regen_coldkey --mnemonic ", ""));
    getColdkeys()
  }
  const regenColdkey = async () => {
    setLoading(true)
    const res = await Api.Coldkeys.regen({name, password, mnemonic:regenMnemonic});
    setRegenPanelOpen(false);
    setRegenMnemonic("");
    setName("");
    setPassword("");
    getColdkeys()
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
        <h3>Coldkeys</h3>
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
            Regen Coldkey
          </Button>
          <Button intent="success" onClick={() => setCreatePanelOpen(true)}>
            Add Coldkey
          </Button>
        </div>
      </div>
      <Table>
        <Table.Head>
          <Table.TextHeaderCell>NAME</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body>
          {coldkeys.length ? (
            coldkeys.map((c) => (
              // @ts-ignore
              <Table.Row key={c?.id}>
                <Table.TextCell>{c.name}</Table.TextCell>
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
              {loading?<div
                style={{
                  padding: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Spinner /> 
              </div>: "No Coldkeys are here"}
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
          <h1>Regen Coldkey</h1>
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
              <TextInputField
                label="Name"
                value={name}
                onChange={({ target: { value } }: any) => setName(value)}
              />
              <TextInputField
                label="Password"
                type="password"
                value={password}
                onChange={({ target: { value } }: any) => setPassword(value)}
              />
              <TextInputField
                label="Mnemonic"
                value={regenMnemonic}
                onChange={({ target: { value } }: any) =>
                  setRegenMnemonic(value)
                }
              />

              <Button intent="success" onClick={regenColdkey}>
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
          <h1>Create Coldkey</h1>
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
              <TextInputField
                label="Name"
                value={name}
                onChange={({ target: { value } }: any) => setName(value)}
              />
              <TextInputField
                label="Password"
                type="password"
                value={password}
                onChange={({ target: { value } }: any) => setPassword(value)}
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
                      setPassword("");
                    }}
                  >
                    The mnemonic is written down
                  </Button>
                </>
              ) : (
                <Button intent="success" onClick={createColdkey}>
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

export default ColdkeysPAge;

import * as React from "react";

import { FormikTextInput, Layout } from "../../components";

import { NextPage } from "next";

import { useRouter } from "next/router";
import { Button, SelectField, SideSheet, Spinner, Table, TableHead } from "evergreen-ui";

import { ColdkeyContext } from "context";
import { useApi, useColdkeys, useHotkeys } from "hooks";
import { useFormik } from "formik";
import { object, string, number, date, InferType } from "yup";

const HotkeysPage: NextPage = () => {
  const Api = useApi();

  const router = useRouter();
  const {hotkeys,setHotkeys} = useHotkeys()
  const {coldkeys,setColdkeys} = useColdkeys()
  const [didInit, setDidInit] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
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


  const createHotkey = async ({
    coldkeyId,
    name,
  }: {
    coldkeyId: number;
    name:string }) => {

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
  const regenHotkey = async ({
    name,
    coldkeyId,
    mnemonic,
  }: {
    name:string;
    coldkeyId:number;
    mnemonic:string;
  }) => {
    if (coldkeyId) {
      setLoading(true);
      const res = await Api.Hotkeys.regen({
        name,
        coldkeyId,
        mnemonic,
      });
      setRegenPanelOpen(false);
      regenFormik.setFieldValue("mnemonic", "");
      regenFormik.setFieldValue("name", "");
      regenFormik.setFieldValue("coldkeyId", null);
      getHotkeys();
    }
  };

   const formik = useFormik({
     initialValues: {
       name: "",
       coldkeyId: null,
     },
     validationSchema: object({
       name: string()
         .min(5)
         .test("no_duplicate_hotkey", "is not unique", (value) => {
           return !value || hotkeys?.map((c) => c.name).indexOf(value) === -1;
         })
         .required(),
       coldkeyId: number().required(),
     }),
     onSubmit: async ({ name, coldkeyId }) => {
      // @ts-ignore
       createHotkey({ name, coldkeyId });
     },
   });
   const regenFormik = useFormik({
     initialValues: {
       name: "",
       coldkeyId: null,
       mnemonic: "",
     },
     validationSchema: object({
       name: string()
         .min(5)
         .test("no_duplicate_hotkey", "is not unique", (value) => {
           return !value || hotkeys?.map((c) => c.name).indexOf(value) === -1;
         })
         .required(),
       coldkeyId: number().required(),
       mnemonic: string()
         .test("menmonic", "invalid mnemonic", (value) => {
           const elevenSpaces = value?.match(/[ ]/g)?.length === 11;
           const noDoubleSpace = !value?.match(/  /g);
           const onlyLowercaseWords = !value?.match(/[^a-z ]/g);

           return elevenSpaces && noDoubleSpace && onlyLowercaseWords;
         })
         .required(),
     }),
     onSubmit: async ({ name, coldkeyId, mnemonic }) => {
       // @ts-ignore
       regenHotkey({ name, coldkeyId, mnemonic });
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
                isInvalid={!!regenFormik.errors.coldkeyId}
                validationMessage={regenFormik.errors.coldkeyId}
                value={regenFormik.values.coldkeyId + ""}
                onChange={
                  // @ts-ignore
                  (e) => regenFormik.setFieldValue("coldkeyId", e.target.value)
                }
              >
                <option>Choose a coldkey</option>

                {coldkeys.map((c) => {
                  //@ts-ignore
                  return <option value={c.id}>{c.name}</option>;
                })}
              </SelectField>
              <FormikTextInput formik={regenFormik} label="Name" name="name" />

              <FormikTextInput
                formik={regenFormik}
                label="Mnemonic"
                name="mnemonic"
              />

              <Button intent="success" onClick={regenFormik.submitForm}>
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
                isInvalid={!!formik.errors.coldkeyId}
                validationMessage={formik.errors.coldkeyId}
                value={formik.values.coldkeyId + ""}
                onChange={
                  // @ts-ignore
                  (e) => formik.setFieldValue("coldkeyId", e.target.value)
                }
              >
                <option>Choose a coldkey</option>

                {coldkeys.map((c) => {
                  //@ts-ignore
                  return <option value={c.id}>{c.name}</option>;
                })}
              </SelectField>
              <FormikTextInput
              name="name"
              formik={formik}
                label="Name"
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
                      formik.setFieldValue("name", "")
                      formik.setFieldValue("coldkeyId", "")
                    }}
                  >
                    The mnemonic is written down
                  </Button>
                </>
              ) : (
                <Button intent="success" onClick={formik.submitForm}>
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

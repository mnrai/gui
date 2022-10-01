import * as React from "react";

import { FormikTextInput, Layout } from "../../components";

import { NextPage } from "next";

import { useRouter } from "next/router";
import { Button, SideSheet, Spinner, Table, TableHead } from "evergreen-ui";

import { ColdkeyContext } from "context";
import { useApi, useHotkeys } from "hooks";
import { useFormik } from "formik";
import { object, string, number, date, InferType } from "yup";

const ColdkeysPAge: NextPage = () => {
 
  const Api = useApi();

  const router = useRouter();
  const {data:coldkeys, setData: setColdkeys} = React.useContext(ColdkeyContext)
  const {hotkeys, setHotkeys} = useHotkeys()
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
    setHotkeys(res.hotkeys);
    setLoading(false)
  }
  React.useEffect(() => {

    getHotkeys();
    getColdkeys()
  }, []);


  const createColdkey = async ({ name, password }: { name:string ;password :string}) => {

    setLoading(true);
    const res = await Api.Coldkeys.create({ name, password });
    setMnemonic(res.mnemonic.replace("btcli regen_coldkey --mnemonic ", ""));
    getColdkeys();
  };
  const regenColdkey = async (
    { name, password, mnemonic }:
    { name:string, password:string, mnemonic:string }
  ) => {
    setLoading(true);
    const res = await Api.Coldkeys.regen({
      name,
      password,
      mnemonic,
    });
    setRegenPanelOpen(false);
    regenFormik.setFieldValue("mnemonic", "")
    regenFormik.setFieldValue("name", "")
    regenFormik.setFieldValue("password", "")
    getColdkeys();
  };

   const formik = useFormik({
     initialValues: {
       name: "",
       password: "",
     },
     validationSchema: object({
       name: string()
         .min(1)
         .test("no_duplicate", "is not unique", (value) => {
           return !value || coldkeys?.map((c) => c.name).indexOf(value) === -1;
         })
         .required(),
       password: string()
         .password()
         .test(
           "only_alphanumeric",
           "Only numbers, letters and capital letters can be entered",
           (value) => {
             return !value?.match(/[^a-zA-Z0-9]/g);
           }
         )
         .minSymbols(0)
         .required(),
     }),
     onSubmit: async ({ name, password }) => {
       createColdkey({ name, password });
     },
   });
   const regenFormik = useFormik({
     initialValues: {
       name: "",
       password: "",
       mnemonic: "",
     },
     validationSchema: object({
       name: string()
         .min(1)
         .test("no_duplicate", "is not unique", value=>{
          return !value || coldkeys?.map((c) => c.name).indexOf(value) === -1;
         })
         .required(),
       password: string().password().test("only_alphanumeric", "Only numbers, letters and capital letters can be entered", (value)=>{
        return !value?.match(/[^a-zA-Z0-9]/g)
       }).minSymbols(0).required(),
       mnemonic: string().test("menmonic", "invalid mnemonic", value=>{
        const elevenSpaces = value?.match(/[ ]/g)?.length === 11;
        const noDoubleSpace = !value?.match(/  /g);
        const onlyLowercaseWords = !value?.match(/[^a-z ]/g);

        return elevenSpaces && noDoubleSpace && onlyLowercaseWords;
       }).required(),
     }),
     onSubmit: async ({ name, password, mnemonic }) => {
       regenColdkey({ name,
        password,
        mnemonic });
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
              <FormikTextInput
              name="name"
              formik={regenFormik}
                label="Name"


              />
              <FormikTextInput
              name="password"
              formik={regenFormik}
                label="Password"
                type="password"


              />
              <FormikTextInput
              name="mnemonic"
              formik={regenFormik}
                label="Mnemonic"
  
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
              <FormikTextInput
                            name="name"
              formik={formik}
                label="Name"

              />
              <FormikTextInput
                            name="password"
              formik={formik}
                label="Password"
                type="password"

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
                      formik.setFieldValue("name", "")
                      formik.setFieldValue("password", "")
                      setMnemonic("");
 
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

export default ColdkeysPAge;

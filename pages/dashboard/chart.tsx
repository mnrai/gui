import * as React from "react";

import { FormikTextInput, Layout } from "../../components";

import { NextPage } from "next";

import { useRouter } from "next/router";
import { Alert, Button, CogIcon, CrossIcon, DotIcon, FormField, IconButton, Menu, MenuIcon, PlayIcon, Popover, Position, ResetIcon, Select, SelectField, SelectMenu, SendToIcon, SideSheet, Spinner, StopIcon, Switch, Table, TableHead } from "evergreen-ui";
import { CopyBlock, dracula } from "react-code-blocks";
import { object, string, number, date, InferType } from "yup";
import * as yup from "yup";

import { ColdkeyContext } from "context";
import { useApi, useColdkeys, useHotkeys,  } from "hooks";
import { useFormik } from "formik";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ChartPage: NextPage = () => {
  const Api = useApi();

  const router = useRouter();
  const [statData,setStatData] = React.useState([])
  const [selectedColdkey,setSelectedColdkey] = React.useState(null)
  const {hotkeys,setHotkeys} = useHotkeys()
  const {coldkeys,setColdkeys} = useColdkeys()
  const [didInit, setDidInit] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [fetchedLogs, setFetchedLogs] = React.useState("");

  const [createPanelOpen, setCreatePanelOpen] = React.useState(false);
  const [logPanelOpen, setLogPanelOpen] = React.useState(false);

const formatDate = (date:Date) => {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return `${month}/${day} ${hour}:${(minute+"").length === 1 ? "0"+minute: minute}`;
}

  React.useEffect(() => {
    getStat();
    getColdkeys();
    getHotkeys();
  }, []);

    const getHotkeys = async () => {
      setLoading(true);
      const res = await Api.Hotkeys.getMultiple();
      if (res.error) {
        return;
      }
      setHotkeys(res.hotkeys);
      setLoading(false);
    };
   const getColdkeys = async () => {
     setLoading(true);
     const res = await Api.Coldkeys.getMultiple();
     if (res.error) {
       return;
     }
     setColdkeys(res.coldkeys);
     setLoading(false);
   };
  const getStat = async () => {
    setLoading(true)
    const res = await Api.Stat.getMultiple();
    if (res.error) {
      return;
    }
    setStatData(res.data)
    setLoading(false)
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
        <h3>Chart</h3>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Select
            value={selectedColdkey || ""}
            onChange={
              // @ts-ignore
              (e) => setSelectedColdkey(e.target.value)
            }
          >
            <option value="">Select a coldkey</option>

            {coldkeys.map((c) => {
              //@ts-ignore
              return <option value={c.id}>{c.name}</option>;
            })}
          </Select>
        </div>
      </div>
      {selectedColdkey ? (
        <>
          <Line
            data={{
              labels: statData
                .filter((s) => s.ColdkeyId === parseInt(selectedColdkey + ""))
                .map((c) => formatDate(new Date(c.createdAt))),
              datasets: [
                {
                  label: coldkeys.find(
                    (c) => c.id === parseInt(selectedColdkey + "")
                  )?.name,
                  borderColor: "#ffcc3c",
                  backgroundColor: "#ffcc3c",
                  data: statData
                    ?.filter(
                      (s) => s.ColdkeyId === parseInt(selectedColdkey + "")
                    )
                    ?.map((c) => c.amount),
                },
              ],
            }}
          />
          <br />
          <br />
          <Line
            data={{
              labels: statData
                .filter((s) => s.ColdkeyId === parseInt(selectedColdkey + ""))
                .map((c) => formatDate(new Date(c.createdAt))),
              datasets: [
                {
                  label: "Trust",
                  borderColor: "#5799ff",
                  backgroundColor: "#5799ff",
                  data: statData
                    ?.filter(
                      (s) => s.ColdkeyId === parseInt(selectedColdkey + "")
                    )
                    ?.map((c) => c.trust),
                },
              ],
            }}
          />
          <br />
          <br />
          <Table>
            <Table.Head>
              <Table.TextHeaderCell>DATE</Table.TextHeaderCell>
              <Table.TextHeaderCell>AMOUNT</Table.TextHeaderCell>
              <Table.TextHeaderCell>TRUST</Table.TextHeaderCell>
            </Table.Head>
            <Table.Body>
              {statData.length ? (
                [...statData]
                  .reverse()
                  .filter(s=>s.ColdkeyId === parseInt(selectedColdkey + ""))
                  .map((h) => (
                    // @ts-ignore
                    <Table.Row key={h?.id}>
                      <Table.TextCell>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {/* @ts-ignore */}
                          {formatDate(new Date(h.createdAt))}
                        </div>
                      </Table.TextCell>

                      {/* @ts-ignore */}

                      <Table.TextCell>{h?.amount}</Table.TextCell>
                      <Table.TextCell>{h?.trust}</Table.TextCell>
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
        </>
      ) : (
        <div
          style={{
            padding: 60,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p style={{ textAlign: "center" }}>Select a coldkey</p>
        </div>
      )}
    </Layout>
  );
};

export default ChartPage;

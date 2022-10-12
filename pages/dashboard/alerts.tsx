import * as React from "react";

import { FormikTextInput, Layout } from "../../components";
import { TextInputField, SideSheet, Button, Spinner } from "evergreen-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useApi } from "hooks";
import { useFormik } from "formik";
import { object, string, number, date, InferType } from "yup";

const Alerts: NextPage = () => {
  const [loading, setLoading] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      telegramGroupChatId: "",
      telegramBotToken: "",
    },
    validationSchema: object({
      telegramGroupChatId: string(),
      telegramBotToken: string(),
    }),
    onSubmit: async ({ telegramGroupChatId, telegramBotToken }) => {
      setLoading(true);
      const res = await Api.User.update({ telegramGroupChatId, telegramBotToken });
      if (!res.error) {
        onSuccess();
      setLoading(false);

      } else {
        setLoading(false);
      }
    },
  });
  const Api = useApi();
  const router = useRouter();
  const [didInit, setDidInit] = React.useState(false);
  const [telegramGroupChatId, setTelegramGroupChatId] = React.useState("");
  const [telegramBotToken, setTelegramBotToken] = React.useState("");

  const onSuccess = () => {

  };

  const getUser = async () => {
    const res = await Api.User.checkToken();

    if (res) {
      formik.setFieldValue("telegramGroupChatId", res.user.telegramGroupChatId);
      formik.setFieldValue("telegramBotToken", res.user.telegramBotToken);
    }
  };

  React.useEffect(() => {
    getUser();
  }, []);

  return (
    <Layout withNav>
      <h3>Alerts</h3>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
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
          <div
            style={{
              maxWidth: 500,
              maxHeight: 200,
              marginTop: 100,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FormikTextInput
              style={{ width: 400 }}
              formik={formik}
              label="Telegram Group Chat Id"
              placeholder="For example: -4325234243"
              name="telegramGroupChatId"
            ></FormikTextInput>
            <FormikTextInput
              style={{ width: 400 }}
              formik={formik}
              label="Telegram Bot token"
              name="telegramBotToken"
            ></FormikTextInput>
            <Button onClick={formik.submitForm}>Submit</Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Alerts;

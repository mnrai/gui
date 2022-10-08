import * as React from "react";

import {

  FormikTextInput,
  Layout,
} from "../components";
import { TextInputField, SideSheet, Button, Spinner } from "evergreen-ui";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useApi } from "hooks";
import { useFormik } from "formik";
import { object, string, number, date, InferType } from "yup";


const Login: NextPage = () => {
  const [loading, setLoading] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: object({
      username: string().min(1).required(),
      password: string().password().required(),
    }),
    onSubmit: async ({ username, password }) => {
      setLoading(true)
      const res = await Api.User.login({ username, password });
      if (!res.error) {
        onSuccess();
      }else {

        setLoading(false);
      }

    },
  });
  const Api = useApi();
  const router = useRouter()
  const [didInit, setDidInit] = React.useState(false);
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")

  const onSuccess= ()=> {
      router.push("/dashboard");

  }

  const checkToken = async() => {
    const res = await Api.User.checkToken();
    if(res.success) {
      onSuccess()
    }
  }

  React.useEffect(()=>{
checkToken()
  },[])

  
  return (
    <Layout withNav={false}>
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
              ) : <div style={{ maxWidth: 500, maxHeight: 200, marginTop:100, display: "flex" , flexDirection: "column", alignItems:"center"}}>
          <FormikTextInput
          style={{width:400}}
            formik={formik}
            label="Username"
            name="username"
            value={username}
            onChange={(e: any) => setUsername(e.target.value)}
          ></FormikTextInput>
          <FormikTextInput
          style={{width:400}}
            formik={formik}
            label="Password"
            name="password"
            value={password}
            type="password"
            onChange={(e: any) => setPassword(e.target.value)}
          ></FormikTextInput>
          <Button onClick={formik.submitForm}>Login</Button>
        </div>}
      </div>
    </Layout>
  );
};

export default Login;

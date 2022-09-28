import * as React from "react";

import {

  Layout,
} from "../../components";

import { NextPage } from "next";

import { useRouter } from "next/router";

const DashboardIndex: NextPage = () => {
  const router = useRouter();
  const [didInit, setDidInit] = React.useState(false);

  React.useEffect(() => {

  }, []);

  
  return (
    <Layout withNav>
      
    </Layout>
  );
};

export default DashboardIndex;

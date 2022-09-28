import * as React from "react";
import { Select } from "evergreen-ui";
import { Header } from "./Header";

const pageStyles = {
  color: "#232129",
  padding: 20,
  fontFamily: "Roboto, sans-serif, serif",
};

const Layout: React.FC<{children:any, withNav:boolean}> = ({children, withNav}) => {

  return (
    <>
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            fontFamily: "Roboto, sans-serif, serif",
            minHeight: "calc(100vh - 60px)",
          }}
        >
          <Header withNav={!!withNav} />
          <main style={pageStyles}>{children}</main>
        </div>
      </div>
    </>
  );
};

export  {Layout}


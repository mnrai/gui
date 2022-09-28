import * as React from "react";
// import { graphql, HeadFC, Link, useStaticQuery } from "gatsby";
import { Select } from "evergreen-ui";
import Link from "next/link";
import { useColdkeys, useHotkeys } from "hooks";



const Header: React.FC<{ withNav:boolean}> = ({withNav }) => {
  const {coldkeys} =useColdkeys()
  const {hotkeys} =useHotkeys()
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          backgroundColor: "#1f2d43",
          padding: 8,
          color: "#ffffff",
        }}
      >
        There is no guarantee for any information on this page and if you decide
        to follow any instruction or command on this page then it is on your own
        risk and if it is not allowed for you to run a miner for any reason then
        I want to strongly advice you to not run a miner. There might be errors
        on this page.
      </p>

    
      {withNav ? (
        <header
          style={{
            marginTop: 40,
            paddingLeft: 20,
            paddingRight: 20,
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
              // paddingLeft: 20,
            }}
          >
            <Link href="/dashboard/coldkeys">
              <p
                style={{
                  fontWeight: "400",
                  letterSpacing: "2px",
                  color: "#393939",
                  marginTop: 0,
                  marginBottom: 0,
                  marginBlockEnd: 0,
                  marginBlockStart: 0,
                  padding: 0,
                  paddingRight: 20,
                  cursor:"pointer"
                }}
              >
                COLDKEYS
              </p>
            </Link>
            {coldkeys.length?<Link href="/dashboard/hotkeys">
              <p
                style={{
                  fontWeight: "400",
                  letterSpacing: "2px",
                  color: "#393939",
                  marginTop: 0,
                  marginBottom: 0,
                  marginBlockEnd: 0,
                  marginBlockStart: 0,
                  padding: 0,
                  paddingRight: 20,
                  cursor:"pointer"
                }}
              >
                HOTKEYS
              </p>
            </Link>:null}
            {hotkeys.length ?<Link href="/dashboard/miners">
              <p
                style={{
                  fontWeight: "400",
                  letterSpacing: "2px",
                  color: "#393939",
                  marginTop: 0,
                  marginBottom: 0,
                  marginBlockEnd: 0,
                  marginBlockStart: 0,
                  padding: 0,
                  paddingRight: 20,
                  cursor:"pointer"
                }}
              >
                MINERS
              </p>
            </Link>:null}
          </div>
        </header>
      ) : null}
    </div>
  );
};

export { Header };

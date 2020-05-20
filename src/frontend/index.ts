import * as React from "react";
import ReactDOM from "react-dom";
import { App } from "./components/App";
import type { FrontendConfig } from "./interfaces/FrontendConfig";

export const execute = (config: FrontendConfig) => {
  ReactDOM.render(
    React.createElement(App, { config }),
    document.getElementById("main")
  );
};

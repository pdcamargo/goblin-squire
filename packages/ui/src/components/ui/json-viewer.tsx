import ReactJsonView from "@uiw/react-json-view";

import { lightTheme } from "@uiw/react-json-view/light";
import { darkTheme } from "@uiw/react-json-view/dark";
import { nordTheme } from "@uiw/react-json-view/nord";
import { githubLightTheme } from "@uiw/react-json-view/githubLight";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import { vscodeTheme } from "@uiw/react-json-view/vscode";
import { gruvboxTheme } from "@uiw/react-json-view/gruvbox";
import { monokaiTheme } from "@uiw/react-json-view/monokai";
import { basicTheme } from "@uiw/react-json-view/basic";

export type JsonViewerProps = {
  theme?:
    | "light"
    | "dark"
    | "nord"
    | "githubLight"
    | "githubDark"
    | "vscode"
    | "gruvbox"
    | "monokai"
    | "basic";
  value: object;
};

const JsonViewer = ({ theme = "githubDark", value }: JsonViewerProps) => {
  const themes = {
    light: lightTheme,
    dark: darkTheme,
    nord: nordTheme,
    githubLight: githubLightTheme,
    githubDark: githubDarkTheme,
    vscode: vscodeTheme,
    gruvbox: gruvboxTheme,
    monokai: monokaiTheme,
    basic: basicTheme,
  };

  return <ReactJsonView value={value} style={themes[theme]} />;
};

export { JsonViewer };

import { css } from "docz-plugin-css";

const themeConfig = {
  mode: "dark",
  colors: {
    primary: "#FF5447",
    sidebarBg: "#311E84",
    background: "#041A28"
  },
  logo: {
    src:
      "https://raw.githubusercontent.com/alanrsoares/re-reduced/master/docs/assets/logo.png",
    width: 200
  }
};

export default {
  title: "re-reduced",
  typescript: true,
  menu: ["Home", "Getting Started", "Type Reference", "API Reference"],
  plugins: [
    css({
      preprocessor: "postcss",
      cssmodules: false
    })
  ],
  themeConfig
};

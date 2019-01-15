import { css } from "docz-plugin-css";

const themeConfig = {
  mode: "dark",
  colors: {
    primary: "#FF5447",
    sidebarBg: "#311E84"
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

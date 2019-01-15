import { css } from "docz-plugin-css";

const themeConfig = {
  colors: {
    primary: "#311E84",
    secondary: "#FF5447"
  },
  logo: {
    src: "assets/logo-positive.svg",
    width: 150
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

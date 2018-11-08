import { css } from "docz-plugin-css";

export default {
  title: "re-reduced",
  typescript: true,
  hashRouter: true,
  themeConfig: {
    colors: {
      primary: "teal"
    }
  },
  menu: ["Home", "Getting Started", "Type Reference", "API Reference"],
  plugins: [
    css({
      preprocessor: "postcss",
      cssmodules: false
    })
  ]
};

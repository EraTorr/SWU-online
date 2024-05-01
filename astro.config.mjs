import { defineConfig } from "astro/config";
import alpinejs from "@astrojs/alpinejs";
import solidJs from "@astrojs/solid-js";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [alpinejs(), solidJs()],
  output: 'hybrid',
  // server: {
  //   headers: {
  //     "Access-Control-Allow-Origin": "*"
  //   }
  // },
  adapter: node({
    mode: "standalone"
  })
});
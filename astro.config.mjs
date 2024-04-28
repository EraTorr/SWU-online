import { defineConfig } from "astro/config";
import alpinejs from "@astrojs/alpinejs";

import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  integrations: [alpinejs(), solidJs()],
});

import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    permissions: ['tabs', 'webNavigation', 'storage'],
    host_permissions: ['*://*.mybigcommerce.com/*','*://*.lightspeedapp.com/*'],
    icons: {
      16: '/icon/dandeliondb_flower.png',
      32: '/icon/dandeliondb_flower.png',
      48: '/icon/dandeliondb_flower.png',
      96: '/icon/dandeliondb_flower.png',
      128: '/icon/dandeliondb_flower.png'
    },
    description: "This extension allows you to integrate DandelionDB's autofill features into your IMS/storepage tech solutions",
    name: "DandelionDB",
    version: "1.0.5"
  },
  runner: {
    disabled: true  // Disable auto-opening browser
  }
});
import { BigCommerceAdapter, type PlatformAdapter } from './platforms/bigcommerce';
import { LightspeedAdapter } from './platforms/lightspeed';

export default defineContentScript({
  matches: ['*://*/*'],
  allFrames: true,
  main() {
    const currentUrl = window.location.href.toLowerCase();
    const isBigCommerce = currentUrl.includes('bigcommerce');
    const isLightspeed = currentUrl.includes('lightspeed') || currentUrl.includes('merchantos');
    
    if (!isBigCommerce && !isLightspeed) {
      return;
    }

    const platform: PlatformAdapter = isLightspeed ? LightspeedAdapter : BigCommerceAdapter;
    
    let isFirstAutofill = true;
    const globalProcessedUrls = new Set<string>();
    const globalCurrentlyProcessing = { value: false };

    function autofillFields(productData: any, settings: any = null) {
      const fields = platform.detectFields();
      let filledCount = 0;

      const autofillSettings = settings || {
        name: true,
        upc: true,
        sku: true,
        brand: true,
        price: true,
        quantity: true,
        description: true,
        images: true
      };

      if (autofillSettings.name && platform.fillField(fields.productName, productData.name, 'productName')) {
        filledCount++;
      }
      
      if (autofillSettings.upc && platform.fillField(fields.upc, productData.upc, 'upc')) {
        filledCount++;
      }
      
      if (autofillSettings.sku && fields.sku) {
        platform.fillSkuField(fields.sku, productData.sku, isFirstAutofill);
        filledCount++;
      }
      
      if (autofillSettings.description && platform.fillField(fields.description, productData.descriptions?.[0], 'description')) {
        filledCount++;
      }
      
      if (autofillSettings.brand && fields.brand) {
        platform.fillBrandField(fields.brand, productData.brand, isFirstAutofill);
        filledCount++;
        isFirstAutofill = false;
      }
      
      if (autofillSettings.price && platform.fillField(fields.price, productData.price, 'price')) {
        filledCount++;
      }

      if (autofillSettings.images && productData.imageURLs && productData.imageURLs.length > 0) {
        platform.addImagesFromUrls(productData.imageURLs, globalProcessedUrls, globalCurrentlyProcessing);
      }

      return filledCount;
    }

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'FILL_FORM') {
        const filled = autofillFields(message.product, message.autofillSettings);
        sendResponse({ success: true, fieldsFilled: filled });
      } else if (message.type === 'DETECT_FIELDS') {
        const fields = platform.detectFields();
        const detectedFieldTypes = Object.entries(fields)
          .filter(([_, element]) => element !== null)
          .map(([fieldType]) => fieldType);
        sendResponse({ success: true, fields: detectedFieldTypes });
      }
      return true;
    });
  },
});
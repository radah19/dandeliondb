export default defineContentScript({
  matches: ['*://*/*'], // match all pages
  allFrames: true, // run in iframes too
  main() {
    const currentUrl = window.location.href.toLowerCase();
    const isLightspeed = currentUrl.includes('lightspeed');
    const isBigCommerce = currentUrl.includes('bigcommerce');
    
    // only log on supported platforms
    if (isLightspeed || isBigCommerce) {
      console.log(`[DandelionDB] Active on ${isLightspeed ? 'Lightspeed' : 'BigCommerce'}`);
    }

    // function to identify product form fields
    function detectProductFields() {
      const fields = {
        productName: null as HTMLInputElement | null,
        upc: null as HTMLInputElement | null,
        sku: null as HTMLInputElement | null,
        description: null as HTMLTextAreaElement | null,
        brand: null as HTMLInputElement | null,
        price: null as HTMLInputElement | null,
      };

      const inputs = document.querySelectorAll<HTMLInputElement>('input');
      const textareas = document.querySelectorAll<HTMLTextAreaElement>('textarea');

      inputs.forEach((input) => {
        // skip non-text inputs
        if (input.type === 'hidden' || input.type === 'submit' || input.type === 'button') {
          return;
        }

        const id = input.id?.toLowerCase() || '';
        const name = input.name?.toLowerCase() || '';
        const placeholder = input.placeholder?.toLowerCase() || '';
        const ariaLabel = input.getAttribute('aria-label')?.toLowerCase() || '';
        const dataName = input.getAttribute('data-name')?.toLowerCase() || '';
        const className = input.className?.toLowerCase() || '';
        const label = findLabelForInput(input)?.toLowerCase() || '';

        const allText = `${id} ${name} ${placeholder} ${label} ${ariaLabel} ${dataName} ${className}`;

        // match product name
        if (!fields.productName && allText.match(/product[\s_-]?name|item[\s_-]?name|\btitle\b|product[\s_-]?title|name\b/)) {
          fields.productName = input;
        }
        // Match UPC
        else if (!fields.upc && allText.match(/\bupc\b|universal[\s_-]?product[\s_-]?code|barcode|gtin/)) {
          fields.upc = input;
        }
        // Match SKU
        else if (!fields.sku && allText.match(/\bsku\b|stock[\s_-]?keeping|item[\s_-]?number|product[\s_-]?code/)) {
          fields.sku = input;
        }
        // Match Brand
        else if (!fields.brand && allText.match(/\bbrand\b|manufacturer|vendor|make\b/)) {
          fields.brand = input;
        }
        // Match Price
        else if (!fields.price && allText.match(/\bprice\b|cost|amount|retail|msrp|\$|dollar/)) {
          fields.price = input;
        }
      });

      // check textareas for description
      textareas.forEach((textarea) => {
        const id = textarea.id?.toLowerCase() || '';
        const name = textarea.name?.toLowerCase() || '';
        const placeholder = textarea.placeholder?.toLowerCase() || '';
        const ariaLabel = textarea.getAttribute('aria-label')?.toLowerCase() || '';
        const label = findLabelForInput(textarea)?.toLowerCase() || '';

        const allText = `${id} ${name} ${placeholder} ${label} ${ariaLabel}`;

        if (!fields.description && allText.match(/description|details|notes|summary|about/)) {
          fields.description = textarea;
        }
      });

      return fields;
    }

    // helper to find label text for an input
    function findLabelForInput(input: HTMLElement): string | null {
      if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) return label.textContent?.trim() || null;
      }

      const parentLabel = input.closest('label');
      if (parentLabel) return parentLabel.textContent?.trim() || null;

      const previousSibling = input.previousElementSibling;
      if (previousSibling?.tagName === 'LABEL') {
        return previousSibling.textContent?.trim() || null;
      }

      const nextSibling = input.nextElementSibling;
      if (nextSibling?.tagName === 'LABEL') {
        return nextSibling.textContent?.trim() || null;
      }

      const parent = input.parentElement;
      if (parent) {
        const nearbyLabel = parent.querySelector('label');
        if (nearbyLabel) return nearbyLabel.textContent?.trim() || null;
      }

      // Check for div/span siblings that might act as labels
      const parentDiv = input.closest('div');
      if (parentDiv) {
        const labelDiv = parentDiv.querySelector('div[class*="label"], span[class*="label"]');
        if (labelDiv) return labelDiv.textContent?.trim() || null;
      }

      return null;
    }

    // function to autofill detected fields
    function autofillFields(productData: any) {
      const fields = detectProductFields();
      let filledCount = 0;

      // helper to fill field and trigger events
      const fillField = (field: HTMLInputElement | HTMLTextAreaElement | null, value: any) => {
        if (field && value != null) {
          field.value = value.toString();
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
          // visual feedback
          field.style.outline = '3px solid #4CAF50';
          field.style.outlineOffset = '2px';
          field.style.backgroundColor = '#e8f5e9';
          setTimeout(() => {
            field.style.outline = '';
            field.style.outlineOffset = '';
            field.style.backgroundColor = '';
          }, 2000);
          filledCount++;
        }
      };

      fillField(fields.productName, productData.name);
      fillField(fields.upc, productData.upc);
      fillField(fields.sku, productData.sku);
      fillField(fields.description, productData.descriptions?.[0]);
      fillField(fields.brand, productData.brand);
      fillField(fields.price, productData.price);

      console.log(`[DandelionDB] Auto-filled ${filledCount} fields`);
      return filledCount;
    }


    // Listen for messages from popup
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'FILL_FORM') {
        const filled = autofillFields(message.product);
        sendResponse({ success: true, fieldsFilled: filled });
      } else if (message.type === 'DETECT_FIELDS') {
        const fields = detectProductFields();
        const detectedFieldTypes = Object.entries(fields)
          .filter(([_, element]) => element !== null)
          .map(([fieldType]) => fieldType);
        sendResponse({ success: true, fields: detectedFieldTypes });
      }
      return true; // Keep message channel open for async response
    });
  },
});
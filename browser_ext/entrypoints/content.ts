export default defineContentScript({
  matches: ['*://*/*'], // match all pages
  allFrames: true, // run in iframes too
  main() {
    const currentUrl = window.location.href.toLowerCase();
    const isLightspeed = currentUrl.includes('lightspeed');
    const isBigCommerce = currentUrl.includes('bigcommerce');
    
    // Track if this is the first autofill after page load
    let isFirstAutofill = true;
    
    // Track processed image URLs globally to prevent duplicates across autofill calls
    const globalProcessedUrls = new Set<string>();
    let globalCurrentlyProcessing = false;
    
    // function to identify product form fields
    function detectProductFields() {
      const fields = {
        productName: null as HTMLInputElement | null,
        upc: null as HTMLInputElement | null,
        sku: null as HTMLInputElement | null,
        description: null as HTMLTextAreaElement | HTMLInputElement | null,
        brand: null as HTMLInputElement | null,
        price: null as HTMLInputElement | null,
        images: null as HTMLButtonElement | null,
      };

      // Try Lightspeed-specific IDs first
      if (isLightspeed) {
        fields.description = document.querySelector<HTMLInputElement>('#view_description');
        fields.upc = document.querySelector<HTMLInputElement>('input#view_upc[name="upc"]');
        fields.sku = document.querySelector<HTMLInputElement>('#view_shop_sku') || 
                     document.querySelector<HTMLInputElement>('#view_man_sku');
        fields.brand = document.querySelector<HTMLInputElement>('#react-select-2-input'); // Brand autocomplete
        fields.price = document.querySelector<HTMLInputElement>('#view_price_default');
        
        // Return early if we found Lightspeed fields
        if (fields.description || fields.upc || fields.sku) {
          return fields;
        }
      }

      // BigCommerce-specific detection
      if (isBigCommerce) {
        // Detect image upload button for BigCommerce
        fields.images = document.querySelector<HTMLButtonElement>('button[ng-click="$ctrl.addFromUrl()"]');
      }

      // Generic field detection fallback
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
        if (!fields.productName && allText.match(/product[\s_-]?name|item[\s_-]?name|\btitle\b|product[\s_-]?title|name\b|description/)) {
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

    function addImagesFromUrls(imageUrls: string[]) {
      if (!imageUrls || imageUrls.length === 0) return;

      // get addURL button
      const addFromUrlButton = document.querySelector('button[ng-click="$ctrl.addFromUrl()"]') as HTMLButtonElement;
      
      if (!addFromUrlButton) {
        return;
      }

      let completedCount = 0;
      // Use global variables to track across function calls

      // Process images sequentially
      const processImage = (index: number) => {
        if (index >= imageUrls.length) {
          globalCurrentlyProcessing = false;
          return;
        }

        const url = imageUrls[index];
        
        // Skip if already processed or currently processing
        if (globalProcessedUrls.has(url)) {
          processImage(index + 1);
          return;
        }
        
        if (globalCurrentlyProcessing) {
          setTimeout(() => processImage(index), 500);
          return;
        }
        
        globalCurrentlyProcessing = true;
        
        // Make sure no modal is open before clicking add button
        const existingModal = document.querySelector('.modal') || document.querySelector('[role="dialog"]');
        if (existingModal && document.body.contains(existingModal)) {
          globalCurrentlyProcessing = false;
          setTimeout(() => processImage(index), 500);
          return;
        }
        
        // Mark this URL as being processed
        globalProcessedUrls.add(url);
        
        // Click the button for each url
        addFromUrlButton.click();
        
        // Wait for modal to appear and fill in the URL
        setTimeout(() => {
          const urlInput = document.querySelector('input#upload-url') as HTMLInputElement;
          const saveButton = document.querySelector('button.button--primary[ng-click="$ctrl.save()"]') as HTMLButtonElement;
          
          if (urlInput && saveButton) {
            // Check if this modal already has a URL (shouldn't happen but let's be safe)
            if (urlInput.value && urlInput.value === url) {
              globalCurrentlyProcessing = false;
              setTimeout(() => processImage(index + 1), 500);
              return;
            }
            
            // Clear any existing value first
            urlInput.value = '';
            
            // Set the URL value
            urlInput.value = url;
            
            // Angular BS
            urlInput.dispatchEvent(new Event('input', { bubbles: true }));
            urlInput.dispatchEvent(new Event('change', { bubbles: true }));
            
            const angularElement = (window as any).angular?.element(urlInput);
            if (angularElement) {
              const scope = angularElement.scope();
              if (scope && scope.$ctrl && scope.$ctrl.onUrlChange) {
                scope.$ctrl.onUrlChange();
                scope.$apply();
              }
            }
            
            // Poll for save button to be enabled (preview loaded)
            let pollAttempts = 0;
            const maxPollAttempts = 30; // 30 attempts * 500ms = 15 seconds max wait
            
            const pollSaveButton = setInterval(() => {
              pollAttempts++;
              const currentSaveButton = document.querySelector('button.button--primary[ng-click="$ctrl.save()"]') as HTMLButtonElement;
              
              if (!currentSaveButton) {
                clearInterval(pollSaveButton);
                globalCurrentlyProcessing = false;
                // Try next image
                setTimeout(() => processImage(index + 1), 1000);
                return;
              }
              
              if (!currentSaveButton.disabled) {
                clearInterval(pollSaveButton);
                currentSaveButton.click();
                
                // Wait for modal to close
                setTimeout(() => {
                  completedCount++;
                  
                  // Poll for modal to close before processing next image
                  let modalCheckAttempts = 0;
                  const checkModalClosed = setInterval(() => {
                    modalCheckAttempts++;
                    const modal = document.querySelector('.modal') || document.querySelector('[role="dialog"]');
                    
                    if (!modal || (modal as HTMLElement).style.display === 'none' || !document.body.contains(modal)) {
                      clearInterval(checkModalClosed);
                      globalCurrentlyProcessing = false;
                      // Process next image
                      setTimeout(() => processImage(index + 1), 500);
                    } else if (modalCheckAttempts > 20) {
                      // If modal doesn't close after 2 seconds, force close it
                      clearInterval(checkModalClosed);
                      
                      // Try to find and click close/cancel button
                      const closeButton = document.querySelector('.modal button[ng-click="$ctrl.cancel()"]') as HTMLButtonElement ||
                                         document.querySelector('.modal .close') as HTMLButtonElement ||
                                         document.querySelector('.modal [aria-label="Close"]') as HTMLButtonElement;
                      
                      if (closeButton) {
                        closeButton.click();
                        // Wait longer after clicking close
                        setTimeout(() => {
                          // Double check modal is gone
                          const stillThere = document.querySelector('.modal');
                          if (stillThere) {
                            (stillThere as HTMLElement).remove();
                            const backdrop = document.querySelector('.modal-backdrop');
                            if (backdrop) backdrop.remove();
                          }
                          globalCurrentlyProcessing = false;
                          setTimeout(() => processImage(index + 1), 500);
                        }, 500);
                      } else {
                        // Force remove modal from DOM
                        if (modal) {
                          (modal as HTMLElement).remove();
                        }
                        // Also remove backdrop if exists
                        const backdrop = document.querySelector('.modal-backdrop');
                        if (backdrop) {
                          backdrop.remove();
                        }
                        globalCurrentlyProcessing = false;
                        // Wait longer before continuing
                        setTimeout(() => processImage(index + 1), 1000);
                      }
                    }
                  }, 100);
                }, 500);
              } else if (pollAttempts >= maxPollAttempts) {
                clearInterval(pollSaveButton);
                globalCurrentlyProcessing = false;
                // Try next image anyway
                setTimeout(() => processImage(index + 1), 1000);
              }
            }, 500);
            
          } else {
            globalCurrentlyProcessing = false;
            // Try next image
            setTimeout(() => processImage(index + 1), 1000);
          }
        }, 500);
      };

      // Start processing first image
      processImage(0);
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

    function autofillFields(productData: any, settings: any = null) {
      const fields = detectProductFields();
      let filledCount = 0;

      // Default to all fields enabled if no settings provided
      const autofillSettings = settings || {
        name: true,
        upc: true,
        sku: true,
        brand: true,
        price: true,
        quantity: true,
        description: true
      };

      // helper to fill field and trigger events
      const fillField = (field: HTMLInputElement | HTMLTextAreaElement | null, value: any, fieldName?: string) => {
        if (field && value != null) {
          field.value = value.toString();
          
          // Trigger standard events
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
          field.dispatchEvent(new Event('keyup', { bubbles: true }));
          
          // Lightspeed-specific: set dx property and trigger viewFieldChanged
          if (isLightspeed) {
            (field as any).dx = true;
            
            // Try to trigger jQuery change event if available
            if ((window as any).$ && (window as any).$(field).length) {
              (window as any).$(field).trigger('change');
              (window as any).$(field).trigger('keyup');
            }
          }
          
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

      if (autofillSettings.name) fillField(fields.productName, productData.name, 'productName');
      if (autofillSettings.upc) fillField(fields.upc, productData.upc, 'upc');
      
      // SKU field on BigCommerce needs delay on first autofill
      if (autofillSettings.sku) {
        if (isBigCommerce && isFirstAutofill) {
          setTimeout(() => fillField(fields.sku, productData.sku, 'sku'), 400);
        } else {
          fillField(fields.sku, productData.sku, 'sku');
        }
      }
      
      if (autofillSettings.description) fillField(fields.description, productData.descriptions?.[0], 'description');
      if (autofillSettings.brand && fields.brand) {
        // Special handling for Lightspeed brand autocomplete
        if (isLightspeed && fields.brand.id === 'react-select-2-input') {
          fillField(fields.brand, productData.brand, 'brand');
          // Trigger keydown to show dropdown suggestions
          fields.brand.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
        } else if (isBigCommerce && fields.brand) {
          if (isFirstAutofill) {
            // First autofill: open dropdown, wait for init, then type
            fields.brand.focus();
            fields.brand.click();
            
            // Wait for dropdown to load, then start typing
            setTimeout(() => {
              if (!fields.brand) return;
              
              // Type the brand name character by character to trigger filtering
              const brandName = productData.brand;
              fields.brand.value = brandName;
              fields.brand.dispatchEvent(new Event('input', { bubbles: true }));
              
              // Wait for filtering, then click first option
              setTimeout(() => {
                const firstOption = document.querySelector('li[role="option"]:not([aria-disabled="true"])');
                if (firstOption instanceof HTMLElement) {
                  firstOption.click();
                }
              }, 500);
            }, 1500);
            
            isFirstAutofill = false;
          } else {
            // Subsequent autofills - dropdown already initialized
            fillField(fields.brand, productData.brand, 'brand');
            
            setTimeout(() => {
              const firstOption = document.querySelector('li[role="option"]:not([aria-disabled="true"])');
              if (firstOption instanceof HTMLElement) {
                firstOption.click();
              }
            }, 300);
          }
        } else {
          fillField(fields.brand, productData.brand, 'brand');
        }
      }
      if (autofillSettings.price) fillField(fields.price, productData.price, 'price');

      // Add images from URLs if enabled
      if (autofillSettings.images && productData.imageURLs && productData.imageURLs.length > 0) {
        addImagesFromUrls(productData.imageURLs);
      }

      return filledCount;
    }


    // Listen for messages from popup
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'FILL_FORM') {
        const filled = autofillFields(message.product, message.autofillSettings);
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
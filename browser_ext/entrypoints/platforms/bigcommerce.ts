export interface PlatformFields {
  productName: HTMLInputElement | null;
  upc: HTMLInputElement | null;
  sku: HTMLInputElement | null;
  description: HTMLTextAreaElement | HTMLInputElement | null;
  brand: HTMLInputElement | null;
  price: HTMLInputElement | null;
  images: HTMLButtonElement | null;
}

export interface PlatformAdapter {
  detectFields(): PlatformFields;
  fillField(field: HTMLInputElement | HTMLTextAreaElement | null, value: any, fieldName?: string): boolean;
  fillBrandField(field: HTMLInputElement, value: string, isFirstAutofill: boolean): void;
  fillSkuField(field: HTMLInputElement, value: string, isFirstAutofill: boolean): void;
  addImagesFromUrls(imageUrls: string[], globalProcessedUrls: Set<string>, globalCurrentlyProcessing: { value: boolean }): void;
}

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

  const parentDiv = input.closest('div');
  if (parentDiv) {
    const labelDiv = parentDiv.querySelector('div[class*="label"], span[class*="label"]');
    if (labelDiv) return labelDiv.textContent?.trim() || null;
  }

  return null;
}

export const BigCommerceAdapter: PlatformAdapter = {
  detectFields(): PlatformFields {
    const fields: PlatformFields = {
      productName: null,
      upc: null,
      sku: null,
      description: null,
      brand: null,
      price: null,
      images: null,
    };

    fields.images = document.querySelector<HTMLButtonElement>('button[ng-click="$ctrl.addFromUrl()"]');

    const inputs = document.querySelectorAll<HTMLInputElement>('input');
    const textareas = document.querySelectorAll<HTMLTextAreaElement>('textarea');

    inputs.forEach((input) => {
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

      if (!fields.productName && allText.match(/product[\s_-]?name|item[\s_-]?name|\btitle\b|product[\s_-]?title|name\b|description/)) {
        fields.productName = input;
      } else if (!fields.upc && allText.match(/\bupc\b|universal[\s_-]?product[\s_-]?code|barcode|gtin/)) {
        fields.upc = input;
      } else if (!fields.sku && allText.match(/\bsku\b|stock[\s_-]?keeping|item[\s_-]?number|product[\s_-]?code/)) {
        fields.sku = input;
      } else if (!fields.brand && allText.match(/\bbrand\b|manufacturer|vendor|make\b/)) {
        fields.brand = input;
      } else if (!fields.price && allText.match(/\bprice\b|cost|amount|retail|msrp|\$|dollar/)) {
        fields.price = input;
      }
    });

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
  },

  fillField(field: HTMLInputElement | HTMLTextAreaElement | null, value: any, fieldName?: string): boolean {
    if (field && value != null) {
      field.value = value.toString();

      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('keyup', { bubbles: true }));

      field.style.outline = '3px solid #4CAF50';
      field.style.outlineOffset = '2px';
      field.style.backgroundColor = '#e8f5e9';
      setTimeout(() => {
        field.style.outline = '';
        field.style.outlineOffset = '';
        field.style.backgroundColor = '';
      }, 2000);
      return true;
    }
    return false;
  },

  fillBrandField(field: HTMLInputElement, value: string, isFirstAutofill: boolean): void {
    if (isFirstAutofill) {
      field.focus();
      field.click();

      setTimeout(() => {
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));

        setTimeout(() => {
          const firstOption = document.querySelector('li[role="option"]:not([aria-disabled="true"])');
          if (firstOption instanceof HTMLElement) {
            firstOption.click();
          }
        }, 500);
      }, 1500);
    } else {
      this.fillField(field, value, 'brand');

      setTimeout(() => {
        const firstOption = document.querySelector('li[role="option"]:not([aria-disabled="true"])');
        if (firstOption instanceof HTMLElement) {
          firstOption.click();
        }
      }, 300);
    }
  },

  fillSkuField(field: HTMLInputElement, value: string, isFirstAutofill: boolean): void {
    if (isFirstAutofill) {
      setTimeout(() => this.fillField(field, value, 'sku'), 400);
    } else {
      this.fillField(field, value, 'sku');
    }
  },

  addImagesFromUrls(imageUrls: string[], globalProcessedUrls: Set<string>, globalCurrentlyProcessing: { value: boolean }): void {
    if (!imageUrls || imageUrls.length === 0) return;

    const addFromUrlButton = document.querySelector('button[ng-click="$ctrl.addFromUrl()"]') as HTMLButtonElement;

    if (!addFromUrlButton) {
      return;
    }

    let completedCount = 0;

    const processImage = (index: number) => {
      if (index >= imageUrls.length) {
        globalCurrentlyProcessing.value = false;
        return;
      }

      const url = imageUrls[index];

      if (globalProcessedUrls.has(url)) {
        processImage(index + 1);
        return;
      }

      if (globalCurrentlyProcessing.value) {
        setTimeout(() => processImage(index), 500);
        return;
      }

      globalCurrentlyProcessing.value = true;

      const existingModal = document.querySelector('.modal') || document.querySelector('[role="dialog"]');
      if (existingModal && document.body.contains(existingModal)) {
        globalCurrentlyProcessing.value = false;
        setTimeout(() => processImage(index), 500);
        return;
      }

      globalProcessedUrls.add(url);

      addFromUrlButton.click();

      setTimeout(() => {
        const urlInput = document.querySelector('input#upload-url') as HTMLInputElement;
        const saveButton = document.querySelector('button.button--primary[ng-click="$ctrl.save()"]') as HTMLButtonElement;

        if (urlInput && saveButton) {
          if (urlInput.value && urlInput.value === url) {
            globalCurrentlyProcessing.value = false;
            setTimeout(() => processImage(index + 1), 500);
            return;
          }

          urlInput.value = '';
          urlInput.value = url;

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

          let pollAttempts = 0;
          const maxPollAttempts = 30;

          const pollSaveButton = setInterval(() => {
            pollAttempts++;
            const currentSaveButton = document.querySelector('button.button--primary[ng-click="$ctrl.save()"]') as HTMLButtonElement;

            if (!currentSaveButton) {
              clearInterval(pollSaveButton);
              globalCurrentlyProcessing.value = false;
              setTimeout(() => processImage(index + 1), 1000);
              return;
            }

            if (!currentSaveButton.disabled) {
              clearInterval(pollSaveButton);
              currentSaveButton.click();

              setTimeout(() => {
                completedCount++;

                let modalCheckAttempts = 0;
                const checkModalClosed = setInterval(() => {
                  modalCheckAttempts++;
                  const modal = document.querySelector('.modal') || document.querySelector('[role="dialog"]');

                  if (!modal || (modal as HTMLElement).style.display === 'none' || !document.body.contains(modal)) {
                    clearInterval(checkModalClosed);
                    globalCurrentlyProcessing.value = false;
                    setTimeout(() => processImage(index + 1), 500);
                  } else if (modalCheckAttempts > 20) {
                    clearInterval(checkModalClosed);

                    const closeButton = document.querySelector('.modal button[ng-click="$ctrl.cancel()"]') as HTMLButtonElement ||
                      document.querySelector('.modal .close') as HTMLButtonElement ||
                      document.querySelector('.modal [aria-label="Close"]') as HTMLButtonElement;

                    if (closeButton) {
                      closeButton.click();
                      setTimeout(() => {
                        const stillThere = document.querySelector('.modal');
                        if (stillThere) {
                          (stillThere as HTMLElement).remove();
                          const backdrop = document.querySelector('.modal-backdrop');
                          if (backdrop) backdrop.remove();
                        }
                        globalCurrentlyProcessing.value = false;
                        setTimeout(() => processImage(index + 1), 500);
                      }, 500);
                    } else {
                      if (modal) {
                        (modal as HTMLElement).remove();
                      }
                      const backdrop = document.querySelector('.modal-backdrop');
                      if (backdrop) {
                        backdrop.remove();
                      }
                      globalCurrentlyProcessing.value = false;
                      setTimeout(() => processImage(index + 1), 1000);
                    }
                  }
                }, 100);
              }, 500);
            } else if (pollAttempts >= maxPollAttempts) {
              clearInterval(pollSaveButton);
              globalCurrentlyProcessing.value = false;
              setTimeout(() => processImage(index + 1), 1000);
            }
          }, 500);

        } else {
          globalCurrentlyProcessing.value = false;
          setTimeout(() => processImage(index + 1), 1000);
        }
      }, 500);
    };

    processImage(0);
  }
};

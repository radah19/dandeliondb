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

export const LightspeedAdapter: PlatformAdapter = {
  detectFields(): PlatformFields {
    const fields: PlatformFields = {
      productName: document.querySelector<HTMLInputElement>('#view_description'),
      upc: document.querySelector<HTMLInputElement>('#view_upc'),
      sku: document.querySelector<HTMLInputElement>('#view_man_sku'),
      description: document.querySelector<HTMLTextAreaElement>('#view_note_id_note_text'),
      brand: document.querySelector<HTMLInputElement>('input[aria-label="brands-autocomplete-input"]'),
      price: document.querySelector<HTMLInputElement>('#view_price_default'),
      images: null,
    };

    return fields;
  },
  

  fillField(field: HTMLInputElement | HTMLTextAreaElement | null, value: any, fieldName?: string): boolean {
    if (field && value != null) {
      field.value = value.toString();

      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('keyup', { bubbles: true }));

      if (field.onchange) {
        field.onchange(new Event('change') as any);
      }
      if ((field as any).onkeyup) {
        (field as any).onkeyup(new Event('keyup') as any);
      }

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
    if (!field) return;

    field.focus();
    field.click();
    field.value = value;
    
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new Event('keydown', { bubbles: true }));
    field.dispatchEvent(new Event('keyup', { bubbles: true }));

    setTimeout(() => {
      const firstOption = document.querySelector('[class*="option"]:not([aria-disabled="true"])');
      if (firstOption instanceof HTMLElement) {
        firstOption.click();
      }
    }, 500);
  },

  fillSkuField(field: HTMLInputElement, value: string, isFirstAutofill: boolean): void {
    this.fillField(field, value, 'sku');
    
    const customSkuField = document.querySelector<HTMLInputElement>('#view_shop_sku');
    if (customSkuField) {
      this.fillField(customSkuField, value, 'custom_sku');
    }
  },

  addImagesFromUrls(imageUrls: string[], globalProcessedUrls: Set<string>, globalCurrentlyProcessing: { value: boolean }): void {
    globalCurrentlyProcessing.value = false;
  },
};

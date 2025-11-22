// this file translate the extension autofill to all available frames. 
// We should prob find a way to make this better later.
export default defineBackground(() => {
  console.log('[DandelionDB] Background script loaded');

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[DandelionDB Background] Received message:', message.type);
    
    if (message.type === 'FILL_FORM' || message.type === 'DETECT_FIELDS') {
      (async () => {
        try {
          // get the active tab
          const tabs = await browser.tabs.query({ active: true, currentWindow: true });
          if (!tabs[0]?.id) {
            sendResponse({ success: false, error: 'No active tab' });
            return;
          }

          const tabId = tabs[0].id;

          // try to send to the main frame first (i don't think this will ever work)
          try {
            const response = await browser.tabs.sendMessage(tabId, message);
            if (response?.success && (message.type === 'DETECT_FIELDS' || response.fieldsFilled > 0)) {
              sendResponse(response);
              return;
            }
          } catch (e) {
            // continue to check iframes
          }

          // if main frame didn't work or found no fields, try all frames
          const frames = await browser.webNavigation.getAllFrames({ tabId });
          
          if (frames) {
            for (const frame of frames) {
              if (frame.frameId === 0) continue; // Skip main frame, already tried
              
              try {
                const response = await browser.tabs.sendMessage(tabId, message, { frameId: frame.frameId });
                if (response?.success) {
                  // for DETECT_FIELDS return first frame with fields
                  if (message.type === 'DETECT_FIELDS' && response.fields?.length > 0) {
                    sendResponse(response);
                    return;
                  }
                  // for FILL_FORM, return first successful fill
                  if (message.type === 'FILL_FORM' && response.fieldsFilled > 0) {
                    sendResponse(response);
                    return;
                  }
                }
              } catch (e) {
                // frame might not have content script, thats okay
                continue;
              }
            }
          }

          sendResponse({ success: false, error: 'No fields found in any frame' });
        } catch (error) {
          console.error('[DandelionDB] Error:', error);
          sendResponse({ success: false, error: String(error) });
        }
      })();

      return true; // Keep message channel open for async response
    }
  });
});
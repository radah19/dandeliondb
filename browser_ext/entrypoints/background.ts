// this file translate the extension autofill to all available frames. 
// We should prob find a way to make this better later.
export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FILL_FORM' || message.type === 'DETECT_FIELDS') {
      (async () => {
        try {
          // Use provided tabId or get from sender
          let tabId = message.tabId || sender.tab?.id;
          
          // If no tabId provided, query for active tab
          if (!tabId) {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tabs[0]?.id) {
              sendResponse({ success: false, error: 'No active tab' });
              return;
            }
            tabId = tabs[0].id;
          }

          // try to send to the main frame first
          let mainFrameResponse = null;
          try {
            const response = await browser.tabs.sendMessage(tabId, message);
            if (response?.success) {
              // For DETECT_FIELDS, only accept if we found fields
              if (message.type === 'DETECT_FIELDS' && response.fields?.length > 0) {
                sendResponse(response);
                return;
              }
              // For FILL_FORM, accept if we filled fields
              if (message.type === 'FILL_FORM' && response.fieldsFilled > 0) {
                sendResponse(response);
                return;
              }
              // Save response but continue checking iframes
              mainFrameResponse = response;
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
          
          // If we got a response from main frame but no fields, return it
          if (mainFrameResponse) {
            sendResponse(mainFrameResponse);
          } else {
            sendResponse({ success: false, error: 'No fields found in any frame' });
          }
        } catch (error) {
          sendResponse({ success: false, error: String(error) });
        }
      })();

      return true; // Keep message channel open for async response
    }
  });
});
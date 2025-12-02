// this file translate the extension autofill to all available frames. 
// We should prob find a way to make this better later.
export default defineBackground(() => {
  console.log('[DandelionDB] Background script loaded');

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[DandelionDB Background] Received message:', message.type);
    
    if (message.type === 'FILL_FORM' || message.type === 'DETECT_FIELDS') {
      (async () => {
        try {
          // Use provided tabId or get from sender
          let tabId = message.tabId || sender.tab?.id;
          
          // If no tabId provided, query for active tab
          if (!tabId) {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (!tabs[0]?.id) {
              console.error('[DandelionDB Background] No active tab found');
              sendResponse({ success: false, error: 'No active tab' });
              return;
            }
            tabId = tabs[0].id;
          }
          
          console.log('[DandelionDB Background] Using tab ID:', tabId);

          // try to send to the main frame first
          let mainFrameResponse = null;
          try {
            const response = await browser.tabs.sendMessage(tabId, message);
            if (response?.success) {
              // For DETECT_FIELDS, only accept if we found fields
              if (message.type === 'DETECT_FIELDS' && response.fields?.length > 0) {
                console.log('[DandelionDB Background] Got response from main frame with fields:', response);
                sendResponse(response);
                return;
              }
              // For FILL_FORM, accept if we filled fields
              if (message.type === 'FILL_FORM' && response.fieldsFilled > 0) {
                console.log('[DandelionDB Background] Got response from main frame:', response);
                sendResponse(response);
                return;
              }
              // Save response but continue checking iframes
              mainFrameResponse = response;
              console.log('[DandelionDB Background] Main frame returned empty, checking iframes...');
            }
          } catch (e) {
            console.log('[DandelionDB Background] Main frame failed, checking iframes:', e);
            // continue to check iframes
          }

          // if main frame didn't work or found no fields, try all frames
          const frames = await browser.webNavigation.getAllFrames({ tabId });
          
          console.log('[DandelionDB Background] Checking', frames?.length || 0, 'frames');
          
          if (frames) {
            for (const frame of frames) {
              if (frame.frameId === 0) continue; // Skip main frame, already tried
              
              console.log('[DandelionDB Background] Checking frame', frame.frameId, 'URL:', frame.url);
              
              try {
                const response = await browser.tabs.sendMessage(tabId, message, { frameId: frame.frameId });
                console.log('[DandelionDB Background] Frame', frame.frameId, 'response:', response);
                
                if (response?.success) {
                  // for DETECT_FIELDS return first frame with fields
                  if (message.type === 'DETECT_FIELDS' && response.fields?.length > 0) {
                    console.log('[DandelionDB Background] Found fields in frame', frame.frameId);
                    sendResponse(response);
                    return;
                  }
                  // for FILL_FORM, return first successful fill
                  if (message.type === 'FILL_FORM' && response.fieldsFilled > 0) {
                    console.log('[DandelionDB Background] Filled fields in frame', frame.frameId);
                    sendResponse(response);
                    return;
                  }
                }
              } catch (e) {
                console.log('[DandelionDB Background] Frame', frame.frameId, 'error:', e);
                // frame might not have content script, thats okay
                continue;
              }
            }
          }

          console.log('[DandelionDB Background] No fields found in any frame, returning main frame response or error');
          
          // If we got a response from main frame but no fields, return it
          if (mainFrameResponse) {
            sendResponse(mainFrameResponse);
          } else {
            sendResponse({ success: false, error: 'No fields found in any frame' });
          }
        } catch (error) {
          console.error('[DandelionDB] Error:', error);
          sendResponse({ success: false, error: String(error) });
        }
      })();

      return true; // Keep message channel open for async response
    }
  });
});
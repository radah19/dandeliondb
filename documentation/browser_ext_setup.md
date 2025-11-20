# Frontend Set up guide
## Setup
This be easy!
- Open the `.env_template` file, copy & paste into the same directory and then name it to `.env`
- Name the appropriate variables
     - `BACKEND_URL` could be `http://localhost:8080`
     - `FRONTEND_URL` I don't think is used but left there just in case. I left it as `https://dandeliondb.up.railway.app`
     - `PORT` is just 3000 by default for WXT
- On a terminal, run `npm i` in the client directory
- Run `npm run dev` to run locally!
## Getting the Local Browser Extension ID
To actually allow your local WXT app make requests to your locally run backend, you have to get the extension ID as browser extensions do not make requests from some HTTP domain, rather they look something more like `chrome-extension://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- When running your app locally on Chrome (using `npm run dev`), in your Dev Tools console type `chrome.runtime.id`. You should get the ID for your extension that you can fill into the following blank to get the link to whitelist on the backend: `chrome-extension://_________________________________`
     - To open your browser extension's dev tools, on Chrome with the browser extension window open right click the app and then click inspect
- When running your app locally on Firefox (using `npm run dev:firefox`) I have no idea how to get it as I don't know how to open the dev tools on Firefox's browser extensions
- After getting these links, feel free to add them to your `BROWSER_EXT_URLS` environment variable on the backend Springboot project!

When we actually put the extension onto the Firefox/Chrome web stores, this link will be provided to us and we won't have to worry about doing this.

# Backend Set up guide
Me when I have to set up 100 secret keys so that I can get my local API to run & test one endpoint 😔😔😔😔😔😔😔 `
## AWS Access
We have an IAM account for us to all globally access. Work with someone who has AWS set up for these steps
- Login in as root user [here](https://console.aws.amazon.com/console/home/?nc2=h_si&src=header-signin) and click the "Sign in using root user email" button
## Adding Env Variables to Intellij
- On the Intellij toolbar, right click BackendApplication.java & click `More Run/Debug`->`Modify Run Configuration`
- Click the "Edit Environment Variables" button & from there, add the variables referenced in `application.properties`
     - `FRONTEND_URLS` is our frontend, ex: `http://localhost:5173`, `https://dandeliondb.up.railway.app`
     - `BROWSER_EXT_URLS` is our browser extension URL, ex: `chrome-extension://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
          - It's annoying to get the local extension IDs for this. Refer to `browser_ext_setup.md` for getting this
     - `WEB_URLS` will be used by the scraper, ex: `http://localhost:6767` 
          - See more about it in `saving_websites_to_scrape.md`. You may also ignore it, the backend doesn't need it to run
     - The AWS variables (`AWS_SECRET_KEY`,`AWS_REGION`,`AWS_ACCESS_KEY`) will need to be taken from the IAM account
- Now you should be able to run the API without many issues!
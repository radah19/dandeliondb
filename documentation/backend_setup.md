# Backend Set up guide
Me when I have to set up 100 secret keys so that I can get my local API to run & test one endpoint 😔😔😔😔😔😔😔 `
## AWS Access
We have an IAM account for us to all globally access. Work with someone who has AWS set up for these steps
- Login in as root user [here](https://console.aws.amazon.com/console/home/?nc2=h_si&src=header-signin) and click the "Sign in using root user email" button
- Work with a friend to enter the correct username, password, and MFA code
- After signing into the dashboard, in the top right click `"username"` -> `Security Credentials`
- On the security credentials menu, you should see a button to `Assign a MFA Device`
- Fill out the details and add your MFA device. I would just use DUO mobile & have AWS generate a QR code (`Authenticator App` option) for DUO to scan
- After setting that up, copy the access key and region values, they'll be added into the environment configuration for the backend (covered later)
- Get the AWS secret key also from someone, it's a secret so we can't retrieve it from the AWS site 🤫
- Should be set up on AWS afteerwards! We use S3 and DynamoDB
## Redis Access
Our Redis server is on our Railway dashboard! You'll just need to grab the variables from the Redis server's secret variables menu, and put them into your environment file/config.
- `REDIS_HOST` is `interchange.proxy.rlwy.net`
- `REDIS_PORT` is `33558`
- Grab `REDIS_PASSWORD` from Railway!
## Adding Env Variables to Intellij
- First, install the Maven dependencies by going into the `pom.xml` & downloading all sources/packages.
     - If you're using IntelliJ, there should just be a button in the top right of the `pom.xml` file that lets you do this, otherwise you may have to search up how to install the Maven dependencies.
- Afterwards, on the Intellij toolbar, right click BackendApplication.java & click `More Run/Debug`->`Modify Run Configuration`
- Click the "Edit Environment Variables" button & from there, add the variables referenced in `application.properties`
     - `FRONTEND_URLS` is our frontend, ex: `http://localhost:5173`, `https://dandeliondb.up.railway.app`
     - `BROWSER_EXT_URLS` is our browser extension URL, ex: `chrome-extension://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
          - It's annoying to get the local extension IDs for this. Refer to `browser_ext_setup.md` for getting this
     - `WEB_URLS` will be used by the scraper, ex: `http://localhost:6767` 
          - See more about it in `saving_websites_to_scrape.md`. You may also ignore it, the backend doesn't need it to run
     - The AWS variables (`AWS_SECRET_KEY`,`AWS_REGION`,`AWS_ACCESS_KEY`) will need to be taken from the IAM account
- Now you should be able to run the API without many issues!
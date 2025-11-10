# How to Locally save websites to scrape
We don't want to be writing a web scraper and in the midst of it create a DoS attack for one of our cherished toy stores!
We need a way to freely test our web scraper without killing other sites, that too within ethical bounds!

## Install Wget
GNU Wget is a free utility for non-interactive download of files from the Web. It supports HTTP, HTTPS, and FTP protocols, as well as retrieval through HTTP proxies. 

For Windows plebs, we install it using `winget` or `chocolately`

```shell
# Chocolately
choco install wget

# Winget
winget install GnuWin32.Wget
```
Also seems to be installable here: http://eternallybored.org/misc/wget/
## Run Wget on website you wish to save locally (probably don't run Wget locally, use PACE ICE mentioned below)
For if I wanted to save `https://playermattertoys.com/`, I could run the following command:
```shell
wget --mirror -e robots=on --convert-links --adjust-extension --page-requisites --no-parent --wait=2 --random-wait --limit-rate=200k --reject-regex="(logout|login|signup)" --level=2 https://playmatterstoys.com/
```
_Note: If the website has something like a www and you don't include it, wget won't work! Just copy whatever link on the homepage you find when running Wget._

Overview of what these all do, with information stolen entirely from the [Wget manual](https://www.gnu.org/software/wget/manual/wget.html)
- `--mirror`: Turns on options suitable for mirroring a webpage
- `--convert-links`: After the download is complete, converts the links in the document to make them suitable for local viewing.
- `--wait=[seconds]`: Wait the specified number of seconds between the retrievals. Use of this option is recommended, as it lightens the server load by making the requests less frequent.
- `--random-wait`: Prevents websites from being able to tell our web-scraper is scraping it 🕵️
- `--limit-rate=[amount]`: Limit the download speed to _amount_ bytes per second, helps also with limiting risk of a DoS attack. This kind of makes the whole process very slow though!
- `-level=[amount]`: Limits Wget to crawl only _amount_ pages deep.
- `--no-parent`: Disallows ascent to the parent directory/directories. This can be helpful if we have a certain toy catalog page we want to scrape, and don't want to route out of it. The example lowkey doesn't make use of this 💔
- `--adjust-extension`: Helps with the static page conversion for file extensions.
- `--page-requisites`: Tell Wget to get all the files needed to display a webpage it's currently downloading.
- `--reject-regex="(logout|login|signup)"`: Helps reject going to signup/login links.
- `-e robots=on`: Makes Wget respect [robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)

## Run Wget on PACE ICE
So Wget takes a while, and it's probably also better to run Wget overnight since we don't want other traffic contributing to a website's resource usage.

That's where PACE ICE comes in! We can run a job overnight.
### How-to
To do so, access the [PACE ICE OnDemand job menu](https://ondemand-ice.pace.gatech.edu/pun/sys/myjobs/workflows).
_PACE ICE isn't accessible if you're not on the GT VPN, so either do this on campus or download the Gatech VPN service._

Then click `New Job` -> `From Default Template`

If should create a job template with a script call `main.sh` to run. Scroll down and click the `Open Editor` button to edit the shell's scripts content. Put the wget command we had here:
```shell
#!/bin/bash
# JOB HEADERS HERE

wget --mirror -e robots=on --convert-links --adjust-extension --page-requisites --no-parent --wait=2 --random-wait --limit-rate=200k --reject-regex="(logout|login|signup)" --level=2 https://playmatterstoys.com/
```

Afterwards, go back to the job dashboard, then click the green `Submit` button to run the job.

After probably a lot of time, your job will complete! You can check the outputted file by clicking the job on your job dashboard, scrolling down and clicking the `Open Dir` button to open the PACE ICE directory it was saved on.

You can download the folder from PACE and move onto the next steps.

## Run Website Locally
Since we're using node for this project, we can use the `http-server` node module to locally host the static pages Wget has downloaded for us: https://www.npmjs.com/package/http-server/

```shell
# Global install so we can run http-server anywhere
npm install --global http-server
```

```shell
# In the directory you want to serve, run the following
http-server -p 6767
```
## Performing the Scrape
Ideally you modify the backend's application properties file [here](https://github.com/radah19/dandeliondb/blob/2ba200384017afd6a19a23bde8b6d3e75407e830/backend/src/main/resources/application.properties#L7)
```java
urltoscrape.urls=http://localhost:6767
```
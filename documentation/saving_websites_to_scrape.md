# How to Locally save websites to scrape
We don't want to be writing a web scraper and in the midst of it create a DoS attack for one of our cherished toy stores!
We need a way to freely test our web scraper without killing other sites, that too within ethical bounds!

## Install `wget`
## Run `wget` on website you wish to save locally

```batch
wget --mirror \
     --convert-links \
     --adjust-extension \
     --page-requisites \
     --no-parent \
     --wait=2 \
     --random-wait \
     --limit-rate=200k \
     --reject-regex="(logout|login)" \
     https://example.com/
```

Overview of what these all do:
- `--mirror` will clone the provided HTML webpage

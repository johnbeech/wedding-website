# Hosted Sub Domain

We want people following fancy URLs such as `mywedding.wedding` to reach the website when hosted on a shared domain.

For example, if the wedding website is hosted on `wedding.myowndomain.com`, then visiting `myowndomain.com` through `mywedding.wedding` should redirect to `wedding.mywedding.wedding`.

## Prerequisites

- A LAMP webserver with a `wedding.` subdomain

## Features

- `.htaccess` file will redirect any requests to `/index.php`. `.htaccess` will also redirect `/rsvp` to the wedding subdomain.
- `/index.php` will either proxy `index.html`, or switch to the wedding subdomain based on the request URL.

## Deployment

- Upload `index.php` and `.htaccess` to the root of `myowndomain.com`
- Warning: if you already have a `.htaccess` then you'll need to modify that file in a way that doesn't cause conflicts - make a backup of the existing file before you start screwing around

 

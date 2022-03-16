# AWS CloudFront URL Forwarding Function

This repository contains a CloudFront function to forward short URLs to long URLs, as well as code to generate the function code from a config file.

This implementation of a URL forwarder is a good option if:

- You want to manage short links and forwards via code and don't need a UI
- You don't have hundreds of links to forward
- You don't need the forwarding function function to access external files (e.g., a file from S3) or make network calls
- You want a low-cost method for forwarding links

If you need any of the above, you may benefit from using a CloudFront Lambda@Edge function instead.

A detailed blog post is in progress, and this README will be updated once the post is published.

## Prerequisites

Ensure you have NodeJS and NPM installed locally.
- Note: This repo uses [asdf-vm's](https://github.com/asdf-vm/asdf) `.tool-versions` file to manage the NodeJs version.

Run `npm install` to install Handlebars and ESLint.

Optionally, install and configure the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) if you intend to interact with your CloudFront function via the terminal.

## Usage

Update the `config.json` file with your links and the default redirect URL when the CloudFront request path does not match a specified link. For example:

```json
{
    "links": {
        "test": "example.com",
        "foo": "example.com/bar"
    },
    "defaultRedirect": "github.com"
}
```

Notes:
- Links as specified in the format `"path": "forwarding-url.com"`.
- The leading `/` from the path can be omitted in the config, as the function removes the leading `/` from the URI passed from CloudFront.
- On all forwarded URLs, `https://` can be omitted in the config, as the function adds it to any URL before returning the 302 redirect response.

To generate the CloudFront function with your config values, run `npm run build`.

This will update the `url-forward-build.js` function file in the `dist` directory.

If you haven't created a CloudFront function yet, refer to the [AWS CloudFront documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/create-function.html) for steps to create a new function via the console or via the CLI. If creating the function via the CLI, you can pass in the generated function code directly, for example:

```
aws cloudfront create-function \
    --name FunctionName \
    --function-config Comment="Example function",Runtime="cloudfront-js-1.0" \
    --function-code fileb://dist/url-shortener-build.js
```

After making a chance, you can update your CloudFront function with the generated build code either via the [AWS CloudFront Function Console](https://console.aws.amazon.com/cloudfront/v3/home#/functions) or via the CLI. If using the CLI to update the function, use the ETag returned from the `create-function` command or run `aws cloudfront describe-function --name <value> --stage DEVELOPMENT` to retrieve the current ETag for the function.

Then update the function:

```
aws cloudfront update-function \
    --name FunctionName \
    --function-config Comment="Example function",Runtime="cloudfront-js-1.0" \
    --function-code fileb://dist/url-shortener-build.js \
    --if-match FUNCTIONETag
```

## Testing

You can test your CloudFront function on AWS either via the [AWS CloudFront Function Console](https://console.aws.amazon.com/cloudfront/v3/home#/functions) or via the AWS CLI.

In the `test-events` directory of this repo you'll find 3 example viewer-request events: `request-test-route.json` and `request-foo-route.json` match the example short links in the config and `request-base-route.json` should result in the default redirect to be returned.

To test your function in the development stage via the CLI, run `aws cloudfront describe-function --name <value> --stage DEVELOPMENT` to retrieve the function's ETag.

With the function's ETag, you can now run:

```
aws cloudfront test-function \
    --name FunctionName \
    --if-match FUNCTIONETag \
    --event-object fileb://test-events/request-base-route.json
    --stage DEVELOPMENT
```

## To-Do

I have a few next steps in mind which I'm exploring:

- Create a script to execute the AWS CLI commands to simplify the create/update/test actions
- Set up local testing of the function
- Provide Terraform and CloudFront code to create and manage the CloudFront distribution and function
- Add additional function features, such as using query strings in forwarding logic, optionally omitting the default redirect to allow the request to reach the CloudFront origin, and optionally returning a cache header

Feel free to open an issue if you have suggestions.

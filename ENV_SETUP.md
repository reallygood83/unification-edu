# Environment Variables Setup Guide

This guide explains how to properly set up environment variables for the Unification Education project, with a focus on configuring the Naver API.

## Introduction to Environment Variables in Next.js

Next.js supports environment variables out of the box, allowing you to:
- Keep sensitive data like API keys secure
- Configure different environments (development, testing, production)
- Access variables from both server and client-side code

In Next.js, environment variables are defined in `.env` files and can be accessed in your code via `process.env.VARIABLE_NAME`.

## Obtaining Naver API Keys

To use the Naver API services, you'll need to obtain API credentials:

1. Visit the [Naver Developers Portal](https://developers.naver.com/)
2. Sign in with your Naver account (or create one if you don't have it)
3. Navigate to "Applications" → "Register Application"
4. Fill in the application details:
   - Application Name: "Unification Education" (or your preferred name)
   - Service URL: Your website URL or localhost during development
   - Callback URL: Your redirect URL after authentication
5. Select the APIs you need (Search, Papago Translation, etc.)
6. Submit the application
7. Once approved, you'll receive your `Client ID` and `Client Secret`

**Note**: Naver API keys must be at least 5 characters long. If you receive shorter keys, contact Naver support as they may be invalid.

## Setting Up .env.local File

1. Create a file named `.env.local` in the root directory of your project
2. Add your Naver API credentials using this format:

```
# Naver API Configuration
NEXT_PUBLIC_NAVER_CLIENT_ID=your_client_id_here
NAVER_CLIENT_SECRET=your_client_secret_here
NAVER_API_URL=https://openapi.naver.com
```

3. Make sure your `.env.local` file is included in `.gitignore` to prevent exposing your credentials in version control

**Important**: Variables prefixed with `NEXT_PUBLIC_` will be exposed to the browser. Only use this prefix for variables that are safe to expose publicly.

## Accessing Environment Variables in Your Code

Server-side code:
```javascript
// This works in API routes and getServerSideProps
const apiKey = process.env.NAVER_CLIENT_SECRET;
```

Client-side code:
```javascript
// Only NEXT_PUBLIC_ variables are available on the client
const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
```

## Configuring Environment Variables in Vercel

When deploying to Vercel:

1. Go to your project dashboard in Vercel
2. Navigate to Settings → Environment Variables
3. Add each environment variable with its corresponding value:
   - Name: `NEXT_PUBLIC_NAVER_CLIENT_ID` 
   - Value: Your client ID
   - Environment: Production (and optionally Preview/Development)
4. Repeat for each environment variable
5. Save and redeploy your application for changes to take effect

## Troubleshooting Common Issues

### API Key Not Being Recognized

- Verify key format: Ensure there are no spaces or quotes around your API keys
- Check variable names: Make sure the variable names in your code exactly match those in your .env file
- Ensure minimum length: Naver API keys must be at least 5 characters long
- Restart server: After modifying your .env files, restart your development server

### 401 Unauthorized Errors

- Check credentials: Verify your Client ID and Client Secret are correct
- Headers format: Ensure you're using the correct header format:
  ```javascript
  const headers = {
    'X-Naver-Client-Id': process.env.NEXT_PUBLIC_NAVER_CLIENT_ID,
    'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
  };
  ```
- API subscription: Confirm you've subscribed to the specific API you're trying to use

### Environment Variables Not Loading

- File location: Ensure your `.env.local` file is in the root directory of your project
- Variable naming: Next.js environment variables must start with `NEXT_PUBLIC_` to be accessible on the client side
- Build process: Environment variables are loaded at build time, so changes require a rebuild

## Best Practices

- Never commit `.env` files to your repository
- Use different environment variables for development and production
- Limit the use of `NEXT_PUBLIC_` prefix to only what's necessary
- Regularly rotate your API credentials for security
- Consider using a service like [Doppler](https://www.doppler.com/) or [Vercel's environment variable UI](https://vercel.com/docs/concepts/projects/environment-variables) for team environments

## Additional Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [Naver API Documentation](https://developers.naver.com/docs/common/openapiguide/)
- [Vercel Environment Variables Guide](https://vercel.com/docs/environment-variables)
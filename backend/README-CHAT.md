# TourNet Chat Support Setup

The chat support feature in TourNet uses Google's Gemini AI to provide intelligent responses to user queries. To set up this feature, you need to configure a valid API key.

## Getting a Gemini API Key

1. Visit the Google AI Studio at: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" and follow the prompts
4. Copy your newly created API key

## Configuring the API Key

1. Open the `backend/.env` file
2. Locate the `GEMINI_API_KEY` entry
3. Replace `YOUR_GEMINI_API_KEY` with the API key you copied
4. Save the file

Example:
```
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Testing Your API Key

Run the testing script to verify your API key works:

```
cd backend
node test-gemini.js
```

If successful, you'll see a message indicating that the API key is working.

## Common Issues

### API Key Not Valid
- Make sure you've copied the entire API key
- Ensure there are no extra spaces before or after the key
- Confirm that the API key starts with "AIza"

### API Quota Exceeded
- Gemini API has usage limits. Free tier typically allows:
  - 60 requests per minute
  - Up to 100,000 characters per request
  - Daily and monthly usage caps may apply
- If you frequently see quota errors:
  1. Consider enabling billing in Google Cloud Console
  2. Implement caching for common questions
  3. Reduce the complexity of your prompts

### Service Availability Issues
If you see messages like "I'm having trouble connecting to my knowledge base", it could mean:
- Temporary outage of the Gemini API service
- Network connectivity issues between your server and Google's services
- Your API key might be rate-limited due to excessive requests

To troubleshoot service availability:
1. Check [Google Cloud Status Dashboard](https://status.cloud.google.com/) for any ongoing issues
2. Add delay between requests if you're making many in a short time
3. Try restarting your server
4. Verify your network can reach Google's API endpoints

### Network Connection Issues
- Verify your server has internet access
- Check if a firewall might be blocking outgoing connections
- Make sure DNS resolution is working correctly
- Try using a VPN or proxy if your network blocks Google services

## Administration

The chat support feature includes an admin panel that allows you to view chat sessions and message history. Access it at:

```
http://localhost:3000/admin-support
```

## Support

If you encounter any issues with the chat support feature, please contact the development team. 
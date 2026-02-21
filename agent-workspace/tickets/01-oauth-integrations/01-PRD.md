# PRD — Real OAuth Integrations (Google, Meta, LinkedIn)

## Problem
Current integration forms are fake — they store a name/URL but have no real credentials. The "Check" button pings a URL with HEAD rather than calling real APIs. This is misleading and provides no actual value.

## Goal
Replace all fake integration forms with real OAuth 2.0 flows for Google (Search Console, Analytics, Google Ads), Meta (Facebook + Instagram), and LinkedIn. Each integration stores encrypted access/refresh tokens and can verify a live API connection.

## Providers

| Provider | Features | Scopes |
|---|---|---|
| Google | Search Console, GA4, Google Ads | webmasters.readonly, analytics.readonly, adwords |
| Meta | Facebook + Instagram | pages_read_engagement, instagram_basic, ads_read |
| LinkedIn | Company + Ads | r_organization_social, rw_ads, r_basicprofile |

## Required Env Vars
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
META_APP_ID
META_APP_SECRET
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
```
(NEXTAUTH_URL already exists and is used as APP_URL for redirect URIs)

## User Flow
1. User visits /integrations page
2. Clicks "Connect with Google/Meta/LinkedIn" button on any section
3. Browser is redirected to the provider's OAuth consent screen
4. User approves access
5. Provider redirects back to /api/auth/callback/[provider]
6. Server verifies state, exchanges code for tokens, saves encrypted to DB
7. User is redirected back to /integrations with green dot shown

## Connection Check
- Green dot (ok): token is valid, real API call succeeds
- Red dot (error): token expired and can't refresh, or API call fails
- Yellow dot (not verified): newly added, never checked

## Reconnect
- Clicking "Reconnect" button re-initiates the OAuth flow for that provider

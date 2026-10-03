# Before and after

This file is loaded **only when asked for**. That is the point of keeping it
separate: the SKILL.md above costs tokens in every session, this file costs
nothing until Claude actually reads it.

## Sentence length

**Before** (34 words, passive, hedged)

> In order to be able to successfully configure the authentication mechanism, it
> is necessary for the user to first obtain an API token, which can be generated
> by navigating to the Settings page.

**After** (2 sentences, 8 and 6 words)

> To configure authentication, first get an API token. Generate one on the
> **Settings** page.

## Banned words

| Before | After |
|---|---|
| "Simply click Save." | "Click **Save**." |
| "Just add the header." | "Add the header." |
| "Obviously you'll need an account." | "You need an account." |
| "Note that the file must be UTF-8." | "The file must be UTF-8." |

## Heading case

| Before | After |
|---|---|
| `## Getting Started With The Orders API` | `## Get started with the Orders API` |
| `## Troubleshooting Common Errors` | `## Troubleshoot common errors` |

## Parallel lists

**Before**

- Configure the endpoint
- Authentication setup
- You should then test it

**After**

- Configure the endpoint
- Set up authentication
- Test the connection

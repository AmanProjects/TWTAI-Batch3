# Create User API

## Description

Creates a new user account in the system. Returns the created user object with a system-assigned ID.

## Authentication

Requires a valid Bearer token in the `Authorization` header. The token must have the `users:write` scope.

```
Authorization: Bearer <your-token>
```

## Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `email` | string | Yes | The user's email address. Must be unique. |
| `name` | string | Yes | Display name for the user. 1–100 characters. |
| `role` | string | No | One of `admin`, `editor`, `viewer`. Defaults to `viewer`. |

## Response

Returns `201 Created` with the new user object:

```json
{
  "id": "usr_01j8k...",
  "email": "alex@example.com",
  "name": "Alex Kim",
  "role": "viewer",
  "created_at": "2024-03-15T10:30:00Z"
}
```

## Errors

| Status | Code | Description |
|--------|------|-------------|
| `400` | `invalid_email` | The email address is malformed. |
| `409` | `email_exists` | An account with this email already exists. |
| `401` | `unauthorized` | Missing or invalid Bearer token. |
| `403` | `forbidden` | Token does not have `users:write` scope. |

## Example

```bash
curl -X POST https://api.example.com/v1/users \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{"email": "alex@example.com", "name": "Alex Kim"}'
```

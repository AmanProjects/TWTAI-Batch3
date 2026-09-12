# Get User Profile

## Description

Retrieve the profile information for a specific user by their unique identifier. Returns the user's display name, email, role, and account status. Use this endpoint to populate user profile pages or verify user details before performing actions on their behalf.

## Authentication

This endpoint requires a valid Bearer token in the `Authorization` header. Tokens are obtained via the `/auth/token` endpoint.

```
Authorization: Bearer <your-api-token>
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_id` | string | Yes | The unique identifier of the user (UUID format) |
| `include_metadata` | boolean | No | When `true`, includes extended metadata fields. Default: `false` |
| `fields` | string | No | Comma-separated list of fields to return. Default: all fields |

## Response

### Success (200 OK)

```json
{
  "id": "usr_abc123def456",
  "display_name": "Jane Smith",
  "email": "jane.smith@example.com",
  "role": "editor",
  "status": "active",
  "created_at": "2024-01-15T09:30:00Z",
  "last_login": "2024-03-10T14:22:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique user identifier |
| `display_name` | string | User's chosen display name |
| `email` | string | Primary email address |
| `role` | string | One of: `viewer`, `editor`, `admin`, `owner` |
| `status` | string | One of: `active`, `suspended`, `deactivated` |
| `created_at` | string | ISO 8601 timestamp of account creation |
| `last_login` | string | ISO 8601 timestamp of most recent login |

## Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | `invalid_request` | The `user_id` format is invalid |
| 401 | `unauthorized` | Missing or expired authentication token |
| 403 | `forbidden` | You do not have permission to view this user |
| 404 | `not_found` | No user exists with the specified ID |
| 429 | `rate_limited` | Too many requests — retry after the `Retry-After` header value |
| 500 | `server_error` | Internal error — contact support if this persists |

## Examples

### cURL

```bash
curl -X GET "https://api.example.com/v1/users/usr_abc123def456" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Accept: application/json"
```

### Python

```python
import requests

response = requests.get(
    "https://api.example.com/v1/users/usr_abc123def456",
    headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."}
)
user = response.json()
print(f"Welcome, {user['display_name']}")
```

### JavaScript

```javascript
const response = await fetch(
  "https://api.example.com/v1/users/usr_abc123def456",
  {
    headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIs..." },
  }
);
const user = await response.json();
console.log(`Welcome, ${user.display_name}`);
```

## Rate Limits

| Plan | Requests per minute | Burst limit |
|------|-------------------|-------------|
| Free | 30 | 5 |
| Pro | 300 | 50 |
| Enterprise | 3,000 | 500 |

When rate limited, the API returns a `429` status code with a `Retry-After` header indicating how many seconds to wait before retrying.

I used the Mermaid MCP server to generate the following:
graph TB
    User["👤 User"]
    Claude["🤖 Claude<br/>(Language Model)"]
    MCPClient["MCP Client<br/>(Claude Code)"]

    subgraph MCP["MCP Protocol Layer"]
        direction LR
        Tools["Tools<br/>(Executable Functions)"]
        Resources["Resources<br/>(Data Access)"]
        Prompts["Prompts<br/>(Reusable Instructions)"]
    end

    MCPServer1["MCP Server 1<br/>(e.g., GitHub)"]
    MCPServer2["MCP Server 2<br/>(e.g., Slack)"]
    MCPServer3["MCP Server 3<br/>(e.g., APIs)"]

    External1["GitHub API"]
    External2["Slack API"]
    External3["External Services"]

    User -->|Natural Language| Claude
    Claude -->|Tool Calls<br/>Requests| MCPClient
    MCPClient -->|Standardized<br/>Protocol| MCP

    MCP -->|Implements| MCPServer1
    MCP -->|Implements| MCPServer2
    MCP -->|Implements| MCPServer3

    MCPServer1 -->|HTTP/REST| External1
    MCPServer2 -->|WebSocket| External2
    MCPServer3 -->|SDK/API| External3

    MCPServer1 -->|Results| MCPClient
    MCPServer2 -->|Results| MCPClient
    MCPServer3 -->|Results| MCPClient

    MCPClient -->|Response| Claude
    Claude -->|Response| User

    style Claude fill:#9f7aea
    style MCPClient fill:#4299e1
    style MCP fill:#48bb78
    style User fill:#ed8936



    This diagram shows:

1. User → Asks Claude a question in natural language
2. Claude → Interprets the request and calls MCP tools/resources
3. MCP Client (Claude Code) → Routes requests to appropriate MCP servers using the standardized MCP protocol
4. MCP Servers → Expose three types of capabilities:
  - Tools — Functions Claude can execute (like reading files, calling APIs)
  - Resources — Data Claude can access (documents, code, configs)
  - Prompts — Reusable instruction templates
5. External Services → Servers connect to APIs, databases, and services
6. Results flow back → Through the client to Claude, which synthesizes a response

The key insight: MCP is a standardized bridge between Claude and any external system, eliminating the need for custom integrations.

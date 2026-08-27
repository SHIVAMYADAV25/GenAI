# Understanding MCP: From stdio and HTTP to MCP Gateway

Recently, I spent some time learning about **MCP (Model Context Protocol)** and how it is used to connect AI applications with external tools, data, and services.

What interested me most was not just how to create an MCP server, but how MCP works internally, how different transports work, and what problems appear when the number of tools starts increasing.

## What is MCP?

**Model Context Protocol (MCP)** is an open protocol that provides a standardized way for AI applications to connect with external tools, resources, and prompts.

Without MCP, an AI application may need a custom integration for every service:

```text
AI Application
 ├── Custom GitHub integration
 ├── Custom Database integration
 ├── Custom Slack integration
 ├── Custom File-system integration
 └── Custom API integration
```

With MCP, these integrations can follow a common protocol:

```text
                AI Application
                      |
                 MCP Client
                      |
          -------------------------
          |           |           |
       MCP Server  MCP Server  MCP Server
          |           |           |
       GitHub      Database      APIs
```

This separation is one of the main ideas behind MCP.

The **MCP server** exposes capabilities, while the **MCP client** connects to those capabilities and makes them available to the AI application.

---

# MCP Architecture

A simple MCP architecture consists of three important parts:

### 1. MCP Host

The **host** is the AI application that the user interacts with.

Examples can include an IDE, coding assistant, or a custom AI application.

### 2. MCP Client

The host contains an MCP client.

The client is responsible for communicating with MCP servers using the MCP protocol.

### 3. MCP Server

The MCP server provides capabilities such as:

* Tools
* Resources
* Prompts

So the basic flow becomes:

```text
User
  ↓
AI Application / Host
  ↓
MCP Client
  ↓
MCP Server
  ↓
External API / Database / Files / Services
```

The important point is that **MCP does not replace the AI model**.

Instead, it provides a standardized communication layer between the AI application and external capabilities.

---

# What Can an MCP Server Provide?

MCP mainly revolves around several primitives.

## Tools

Tools allow the AI application to perform actions.

For example:

```text
search_database()
create_invoice()
send_email()
get_weather()
create_github_issue()
```

A tool normally has information such as:

```text
Name
Description
Input Schema
```

The model can use this information to decide when and how to call the tool.

Tools are therefore generally **action-oriented**.

---

## Resources

Resources provide data that the client can access.

For example:

```text
database://customers
file://project/readme
docs://api/users
```

Resources are primarily about **accessing information**, rather than performing an action.

---

## Prompts

MCP servers can also expose reusable prompt templates.

For example:

```text
code_review
summarize_document
generate_report
```

This allows applications to discover and use standardized prompt templates from MCP servers.

The official SDK documentation describes tools, resources, and prompts as the core capabilities exposed by MCP servers.

---

# How Does MCP Communicate?

This is where I explored two important transports:

## 1. stdio

**stdio** stands for Standard Input / Output.

In this approach, the MCP client starts the MCP server as a local process and communicates with it through:

```text
stdin
stdout
```

The architecture looks like:

```text
AI Application
      |
 MCP Client
      |
   stdio
      |
MCP Server Process
```

For example:

```text
Client
  |
  | stdin/stdout
  ↓
MCP Server
  |
  ↓
Local tools / files / APIs
```

This is particularly useful for **local MCP servers**.

There is no need to expose an HTTP endpoint.

The MCP TypeScript SDK describes stdio as the simplest transport for local, process-spawned integrations.

---

# 2. Streamable HTTP

For remote MCP servers, MCP uses **Streamable HTTP**.

The architecture becomes:

```text
AI Application
      |
 MCP Client
      |
    HTTP
      |
MCP Server
      |
External Services
```

This allows the MCP server to run as a remote service rather than as a local child process.

For example:

```text
https://example.com/mcp
```

The client communicates with the MCP server using MCP messages over HTTP.

This makes MCP much more suitable for:

* Cloud deployments
* Remote servers
* Shared services
* Distributed systems
* Enterprise infrastructure

The current MCP specification uses **Streamable HTTP** for remote deployments, while stdio remains the standard approach for local process-based integrations.

> The older HTTP + SSE transport is now considered legacy/deprecated for new implementations. Streamable HTTP should be preferred.

---

# The Interesting Problem: Too Many Tools

While exploring MCP, I came across an interesting scalability problem.

Imagine an MCP server exposing:

```text
67 tools
```

Each tool can have:

```text
Tool name
Description
Input schema
Parameters
```

If the client retrieves the entire tool catalog and makes all of that information available to the model, the amount of context can become significant.

For example:

```text
MCP Server
 ├── Tool 1
 ├── Tool 2
 ├── Tool 3
 ├── ...
 └── Tool 67
```

Now imagine connecting **10 MCP servers**.

The number of available tools can grow very quickly.

This can create challenges such as:

* Larger tool catalogs
* More context usage
* More tokens
* More tool-selection complexity
* More difficult governance
* More complicated authorization

One important clarification is that **HTTP itself does not inherently require every tool to be loaded into the model**. The issue depends on how the MCP client and surrounding architecture handle tool discovery and exposure.

The newer MCP specification also introduced cache hints for list operations such as `tools/list`, which can help clients avoid unnecessary repeated fetching.

---

# MCP Gateway

This is where an **MCP Gateway** becomes useful.

Instead of connecting the AI application directly to every MCP server:

```text
AI
 |
 +---- MCP Server 1
 |
 +---- MCP Server 2
 |
 +---- MCP Server 3
 |
 +---- MCP Server 4
```

we can introduce a gateway:

```text
                 AI Application
                       |
                  MCP Client
                       |
                 MCP Gateway
                /      |      \
               /       |       \
             MCP 1    MCP 2    MCP 3
```

The gateway becomes a centralized layer between the client and MCP servers.

Depending on its implementation, a gateway can provide capabilities such as:

* Tool routing
* Tool filtering
* Server aggregation
* Authentication
* Authorization
* Rate limiting
* Logging
* Monitoring
* Governance

For example, instead of exposing all 67 tools to every client, a gateway could expose only the tools relevant to a particular application or request.

```text
67 Tools
   ↓
MCP Gateway
   ↓
Relevant tools
   ↓
AI Client
```

This is the part I found particularly interesting because MCP starts looking less like a simple tool integration and more like a **distributed system architecture**.

The latest MCP specification also adds `Mcp-Method` and `Mcp-Name` HTTP headers specifically so gateways, rate limiters, and other infrastructure can route and meter MCP operations without having to inspect the JSON body.

---

# MCP Gateway Is Not Just a "Tool Reducer"

It is important not to think of a gateway as only a solution for the 67-tool problem.

A production gateway can become a central control point.

For example:

```text
                    MCP Gateway
                         |
        ---------------------------------
        |          |          |          |
    Routing      Auth      Logging    Rate Limit
        |
   Tool Filtering
        |
   MCP Servers
```

This becomes especially useful when an organization has many MCP servers.

Instead of every AI application individually managing:

```text
Authentication
Authorization
Routing
Monitoring
Tool discovery
Server connections
```

the gateway can centralize many of these responsibilities.

---

# Security and Vulnerabilities

Another important area I explored was **MCP security**.

Giving an AI model access to tools also means giving it access to actions.

For example:

```text
read_database()
send_email()
delete_file()
execute_command()
transfer_money()
```

The risk is therefore not only the MCP protocol itself.

The bigger concern is what capabilities an MCP server exposes and what permissions the AI receives.

Some important security considerations are:

### Tool Poisoning

A malicious or compromised tool could contain misleading instructions in its description or metadata.

Since the model uses tool descriptions to understand how to use tools, these descriptions should not automatically be treated as trusted instructions.

### Prompt Injection

External content returned from a tool can contain instructions designed to manipulate the model.

For example:

```text
Database Result
      ↓
"Ignore previous instructions..."
      ↓
LLM
```

The model should treat external data as **untrusted data**, not automatically as instructions.

### Excessive Permissions

Giving an MCP server unnecessary permissions increases the potential impact of a compromised or misused tool.

A better approach is:

```text
Least Privilege
      ↓
Only required tools
      ↓
Only required permissions
```

### Authentication and Authorization

Remote MCP servers need proper authentication and authorization.

The current MCP authorization work is aligned with OAuth-based deployments, and the 2026-07-28 specification introduced additional authorization hardening.

---

# MCP and Traditional APIs

MCP does not mean traditional APIs are no longer needed.

A useful way to think about it is:

```text
Traditional API
    ↓
Provides application functionality

MCP
    ↓
Provides a standardized interface
for AI applications to discover
and use that functionality
```

For example, you might already have:

```text
GET /users
POST /payments
GET /orders
```

MCP can provide an AI-friendly interface that allows an agent to discover and invoke appropriate capabilities.

So MCP can sit **above existing services and APIs** rather than replacing them.

---

# Why MCP Is Useful

The main advantage of MCP is **standardization**.

Without MCP:

```text
AI ↔ Custom GitHub Integration
AI ↔ Custom Database Integration
AI ↔ Custom Slack Integration
AI ↔ Custom CRM Integration
```

With MCP:

```text
             MCP
              |
     -------------------
     |        |        |
   GitHub   Database   CRM
```

The same general protocol can be used across different MCP servers.

This makes integrations more reusable and allows MCP clients and servers from different implementations to interoperate.

---

# MCP Is Evolving

One thing that became clear while learning MCP is that it is still evolving quickly.

The **2026-07-28 specification** introduced a major change: MCP's protocol core became stateless, removing the previous protocol-level handshake and session model. This makes remote MCP servers easier to scale behind ordinary HTTP infrastructure and load balancers.

The current direction also includes:

* Better HTTP scalability
* Improved authorization
* Extensions
* Tasks for longer-running work
* MCP Apps for interactive UI
* Better routing and observability
* Better caching and discovery

MCP Apps, for example, allow MCP servers to provide interactive UI resources associated with tools.

The MCP roadmap also shows continued work around agentic messaging, HTTP-native infrastructure, enterprise identity, and improved primitives.

---

# Final Understanding

After exploring MCP, my understanding can be summarized like this:

```text
                 AI Application
                       |
                  MCP Client
                       |
              -------------------
              |                 |
            stdio          Streamable HTTP
              |                 |
         Local MCP         Remote MCP
           Server             Server
                               |
                         MCP Gateway
                               |
                -------------------------
                |           |           |
              Server 1    Server 2    Server 3
```

**MCP provides the standardized communication layer.**

**Tools provide actions.**

**Resources provide data.**

**Prompts provide reusable interaction templates.**

**stdio is useful for local MCP servers.**

**Streamable HTTP is designed for remote MCP servers.**

**MCP Gateway can provide centralized routing, filtering, authentication, authorization, monitoring, and management when the number of servers and tools grows.**

And perhaps the most important thing I learned is that building one MCP server is relatively straightforward.

The more interesting engineering challenge starts when you have **many tools, many servers, multiple users, security requirements, and production-scale infrastructure**.

That is where MCP architecture becomes much more interesting.

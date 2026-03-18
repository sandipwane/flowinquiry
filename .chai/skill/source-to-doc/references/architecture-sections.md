# Architecture Document Sections Guide

## Required Sections (always include)

### 1. Title Page
- Project name, version/date, repository URL
- "Architecture Documentation" subtitle

### 2. Executive Summary
- 3-5 sentences: what the system does, who it serves, key technical decisions
- Non-technical reader should understand the purpose

### 3. System Overview Diagram
- Single high-level Mermaid diagram showing major components
- Include external systems the repo interacts with
- The "30,000 foot view"

### 4. Technology Stack
- Table format: Category | Technology | Purpose
- Categories: Language, Framework, Database, Cache, Queue, CI/CD, Cloud, Monitoring
- Only include what is actually in use (evidence from config files)

### 5. Repository Structure
- Tree diagram limited to 2-3 levels deep
- Annotate each top-level directory with a one-line purpose
- Use code block, NOT Mermaid, for directory trees

### 6. Architecture Pattern
- Name the pattern(s): monolith, microservices, modular monolith, event-driven, CQRS, etc.
- Explain WHY this pattern (if inferable from code)
- Mermaid diagram showing the pattern applied to this specific codebase

### 7. Component Breakdown
- One subsection per major component/service/module
- For each: purpose, key files, dependencies, public interface
- Mermaid diagram showing internal structure (if component is complex enough)

### 8. Data Flow
- Mermaid sequence diagram or flowchart showing primary data paths
- Cover the main user-facing flow (e.g., HTTP request → response)
- Cover any async/background processing flows

### 9. Data Model
- Key entities and their relationships
- Mermaid ER diagram if ORM models or schema files exist
- Limit to 8-12 most important entities; note others exist

### 10. External Integrations
- Third-party services, APIs, databases the system connects to
- How connections are configured (env vars, config files)
- Mermaid diagram showing integration boundaries

### 11. Configuration and Environment
- How the system is configured (env vars, config files, feature flags)
- Key environment variables and their purpose (do NOT include actual values)
- Deployment topology if inferable from Docker/K8s/CI configs

### 12. Key Design Decisions
- Notable technical choices and their trade-offs
- Infer from: framework choice, database choice, architecture pattern, unusual dependencies
- Format: Decision | Context | Trade-offs

## Conditional Sections (include when evidence exists)

### Authentication & Authorization
- Include only if auth-related code, middleware, or config is found
- Describe the auth flow with a sequence diagram

### API Surface
- Include only if the repo exposes APIs
- List major endpoint groups (not every endpoint)
- Note API versioning strategy if present

### Event/Message Architecture
- Include only if message queues, event buses, or pub/sub patterns are found
- Show event flow with Mermaid diagram

### Monorepo / Multi-Package Structure
- Include only if monorepo tooling is detected (lerna, nx, turborepo, workspaces)
- Map package dependencies

## Sections to NEVER Include

- Individual function documentation
- Auto-generated API specs (reference swagger/openapi instead)
- Test descriptions or coverage metrics
- Git history, blame, or contributor lists
- Performance benchmarks or load test results
- Security vulnerability reports
- TODO/FIXME lists from code
- License text (just note the license type)
- Installation or setup instructions (belongs in README)

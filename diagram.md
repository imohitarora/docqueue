# PDF Processing System Architecture

```mermaid
graph TD
    subgraph Client
        UI[Web UI]
        Upload[Upload Component]
        Status[Status Display]
        Search[Search Interface]
    end

    subgraph NextJS Backend
        API[API Routes]
        Storage[File Storage]
        SSE[Server-Sent Events]
    end

    subgraph Queue System
        Bull[BullMQ]
        Worker[PDF Worker]
    end

    subgraph Data Storage
        Redis[(Redis Cache)]
        DB[(PostgreSQL)]
        Prisma[Prisma ORM]
    end

    %% Client Flow
    UI --> Upload
    UI --> Status
    UI --> Search
    Upload --> API
    
    %% Backend Flow
    API --> Storage
    API --> Prisma
    API --> Bull
    SSE --> Status
    
    %% Processing Flow
    Bull --> Worker
    Worker --> Redis
    Worker --> Prisma
    
    %% Data Access
    Prisma --> DB
    API --> Redis
    Search --> Prisma

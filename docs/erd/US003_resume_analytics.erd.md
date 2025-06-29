```mermaid
erDiagram
    User {
        String id PK "uuid"
        String email UK
        String password_hash "nullable"
        String first_name "nullable"
        String last_name "nullable"
        String subscription_tier "default('free')"
        DateTime created_at
        DateTime updated_at
    }

    Resume {
        String id PK "uuid"
        String user_id FK
        String template_id FK "nullable"
        String title "nullable"
        Json content "nullable"
        Json settings "nullable"
        Boolean is_public "default(false)"
        Int view_count "default(0)"
        DateTime created_at
        DateTime updated_at
    }

    Template {
        String id PK "uuid"
        String name
        String category "nullable"
        Boolean is_premium "default(false)"
        Json template_data "nullable"
        String preview_image "nullable"
        DateTime created_at
    }

    ResumeAnalytics {
        String id PK "uuid"
        String resume_id FK
        String event_type
        String visitor_ip "nullable"
        String user_agent "nullable"
        String referrer "nullable"
        DateTime created_at
    }

    User ||--o{ Resume : "has many"
    Template ||--o{ Resume : "can apply to many"
    Resume ||--o{ ResumeAnalytics : "has many events"
    Resume ||--o{ AtsScoreSnapshot : "has many snapshots"
    Resume ||--o{ ResumeViewGeoData : "has many geo data points"

    AtsScoreSnapshot {
        String id PK "uuid"
        String resume_id FK
        Int score "percentage"
        DateTime created_at
    }

    ResumeViewGeoData {
        String id PK "uuid"
        String resume_id FK
        String country_code "ISO 3166-1 alpha-2"
        Int view_count "default(0)"
        DateTime last_updated
    }

    %% Note: AiContentCache is omitted as per focus on resume analytics for US003, US004 & US005
    %% but it exists in the schema.prisma.
```

**Explanation of Relationships:**
*   A `User` can have many `Resume` records. (One-to-Many)
*   A `Template` can be applied to many `Resume` records. (One-to-Many, though a Resume has one Template)
*   A `Resume` can have many `ResumeAnalytics` event records. (One-to-Many)

This diagram reflects the schema defined in `packages/schema/prisma/schema.prisma` focusing on the tables relevant to user resumes and their analytics.
The `ats_score_snapshot` table is not included as its scope for US003 is pending clarification.
The `view_count` on the `Resume` table is noted in `schema.prisma` as potentially redundant if `ResumeAnalytics` is the source of truth for views; this ERD reflects the current schema.

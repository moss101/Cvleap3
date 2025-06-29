# Testing Strategy: Resume Analytics Feature

**Feature:** Resume Performance Analytics (US001, US002, US003)
**PRD Reference:** Section 7 "Testing Strategy"
**Agents File References:** Section 4 (Agent Ecosystem - QA-Validator, self-tests), Section 7 (Coding Standards - Tests), Section 8 (Quality Gates), Section 9 (CI/CD Flow)
**Relevant Documentation:**
- `/docs/resume-analytics/stories.yaml`
- `/designs/US003-analytics-dashboard-spec.md`
- `/docs/resume-analytics/US001_US002-backend-architecture.md`
- `/apps/web/src/components/analytics/AnalyticsDashboardOutline.md`
- `/packages/agents/src/modules/analytics/AnalyticsImplementationOutline.md`

## 1. Overview

This document outlines the testing strategy for the Resume Analytics feature. The goal is to ensure functionality, reliability, performance, and usability across all components. Testing will follow the Arrange-Act-Assert pattern and aim for high coverage (target ≥90% as per `Agents` file, Section 4).

## 2. Test Levels & Types

### 2.1 Unit Testing

- **Focus:** Isolating and testing individual functions, methods, components, and modules.
- **Tools:**
    - Backend (Node.js/Fastify/tRPC in `packages/agents`): Jest (or similar like Vitest). Go-test for any Go microservices (pdf-service, but not directly analytics).
    - Frontend (React/Next.js in `apps/web`): Jest + React Testing Library.
- **Backend Unit Test Areas (`packages/agents/src/modules/analytics/`):**
    - **`analyticsEvent.service.ts`:**
        - `recordEvent()`: Mock DB client. Test event data construction, IP anonymization logic, bot filtering logic. Verify correct data is passed to the DB client.
    - **`analyticsQuery.service.ts`:**
        - `getAggregatedAnalytics()`: Mock DB and Redis clients. Test aggregation logic with various datasets (empty, single event, multiple events). Verify correct cache interaction (get, set). Test authorization logic (user permission check).
    - **`ipAnonymizer.ts`:** Test anonymization for different IP formats (IPv4, IPv6).
    - **`userAgentParser.ts`:** Test parsing of various user agent strings into correct device/OS/browser categories. Mock underlying parsing library if complex.
    - **Zod Schemas (`analytics.schema.ts`):** Test validation for correct and incorrect inputs.
- **Frontend Unit Test Areas (`apps/web/src/features/analytics/components/`):**
    - **`MetricCard.tsx`:** Test rendering with different props (title, value, icon, trend).
    - **Chart Wrapper Components (e.g., `ViewsOverTimeChartWrapper.tsx`):** Mock charting library. Test that data is passed correctly and titles are rendered. Test handling of empty/null data.
    - **`MetricCardsContainer.tsx`, `SupportingChartsContainer.tsx`:** Test correct rendering and layout of child components based on input data.
    - **`AnalyticsDashboard.tsx`:** Mock tRPC hook (`useQuery`). Test rendering of loading state, error state, empty data state, and successful data display by verifying child components receive correct props.

### 2.2 Integration Testing

- **Focus:** Testing interactions between different modules or services.
- **Tools:**
    - Backend: Jest + Supertest (for Fastify event ingestion endpoint), tRPC client for testing tRPC procedures. Requires a test database and Redis instance.
    - Frontend: React Testing Library (testing interaction between parent/child components, context, and mocked API calls).
- **Backend Integration Test Areas:**
    - **Event Ingestion API (`POST /internal/analytics/event`):**
        - Send HTTP requests to the endpoint. Verify correct DB record creation. Test with valid and invalid payloads. Test bot filtering at API level.
    - **tRPC Analytics API (`analyticsTrpcRouter.getResumeAnalytics`):**
        - Call the tRPC procedure with a test client. Seed test database with analytics events. Verify aggregated data matches expectations. Test caching behavior (first call hits DB, subsequent calls hit cache). Test authorization rules.
    - **Service-to-DB Interaction:** Test `AnalyticsEventService` and `AnalyticsQueryService` interacting with a real (test) database to ensure SQL queries/ORM calls are correct.
- **Frontend Integration Test Areas:**
    - **`AnalyticsDashboard.tsx` with mocked tRPC client:**
        - Mock the entire tRPC client to simulate API responses (loading, success with data, error).
        - Verify the `AnalyticsDashboard` component correctly processes these states and renders appropriate UI, including passing data to child chart components.

### 2.3 End-to-End (E2E) Testing

- **Focus:** Testing the entire application flow from the user's perspective.
- **Tool:** Playwright (as per `Agents` file, Section 4 & PRD Section 7.3).
- **E2E Test Scenarios for Analytics:**
    1.  **Event Recording and Dashboard Display:**
        - Login as a test user.
        - Create/select a public resume.
        - Simulate viewing the public resume URL (e.g., directly, or via an iframe if applicable).
        - Simulate downloading the resume.
        - Navigate to the Analytics Dashboard for that resume.
        - **Assert:**
            - Metric cards show at least 1 view and 1 download.
            - "Views Over Time" chart reflects the view event.
            - (Backend check if possible): Verify corresponding records in `resume_analytics` table.
    2.  **Dashboard - Empty State:**
        - Login, create a new resume, make it public.
        - Immediately navigate to its Analytics Dashboard.
        - **Assert:** Empty state message is displayed correctly (e.g., "No analytics data yet...").
    3.  **Dashboard - Multiple Events:**
        - Simulate multiple views from different "sources" (if referrer tracking is testable E2E) and different "devices" (by changing user agent via Playwright).
        - **Assert:**
            - Metric cards update correctly.
            - Charts (Views Over Time, Traffic Sources, Device Breakdown) display aggregated data as expected.
    4.  **Dashboard - Responsiveness (Visual Regression - if set up):**
        - Load the Analytics Dashboard.
        - Change viewport size to different breakpoints (mobile, tablet, desktop).
        - **Assert:** Layout adjusts correctly without visual bugs (can be combined with visual regression testing tools integrated with Playwright).

## 3. Performance Testing (Quality Gates - Agents File Section 8)

- While not strictly functional testing, performance considerations are key.
- **Backend API (`getResumeAnalytics`):**
    - Measure response time under load (e.g., using k6 or similar). Target <500ms (p95) as per architecture.
    - Test with large datasets in `resume_analytics` to ensure query performance and aggregation logic scales.
- **Frontend Dashboard:**
    - Lighthouse PWA score (target ≥90).
    - Largest Contentful Paint (LCP) for dashboard page (target <1.5s p95).
- These will primarily be part of CI quality gates.

## 4. Accessibility Testing (WCAG 2.2 AA - Agents File Section 11)

- **Tools:** Axe (Playwright integration), manual testing with screen readers (VoiceOver, NVDA).
- **Focus:**
    - Color contrast on dashboard elements.
    - Keyboard navigability.
    - ARIA attributes for charts and dynamic content.
    - Semantic HTML structure.

## 5. Test Data Management

- Use dedicated test accounts and seed data for E2E tests.
- For unit/integration tests, use in-memory DBs (if feasible for backend) or transaction-based cleanup for test DBs.
- Generate realistic mock data for various scenarios (e.g., no data, sparse data, dense data).

## 6. CI/CD Integration (Agents File Section 9)

- All tests (unit, integration, E2E) MUST run in the CI pipeline (GitHub Actions).
- QA-Validator Agent (as per Agents file) must approve PRs based on test results and coverage diff.
- Failing tests MUST block merges/deployments.
- Performance and accessibility checks should also be part of CI quality gates.

This testing strategy aims to provide comprehensive coverage for the Resume Analytics feature, aligning with the project's quality standards and agent-driven development model.Okay, I have created the `/tests/analytics/AnalyticsTestingStrategy.md` file.

This completes **Step 9** of the plan.

# GatorHive - Sprint 4 Completion Report

## Frontend 

During Sprint 4, We focused on enhancing the user experience by implementing three new interactive features: Search, Comments/Discussions, and Waitlist, in addition to expanding our unit testing and Cypress tests.

## Features Implemented

1. **Search Functionality**
   - Added a search input to filter events by **title**, **location**, or **description**.
   - Users can now easily find relevant events without scrolling through all items.

2. **Comments / Discussions**
   - Users can **view** and **toggle** comments for each event using a "Show/Hide Comments" button.
   - Uses `GET /events/:id/comments` to fetch and display comment threads.

3. **Waitlist Functionality**
   - When an event reaches full capacity, users are given the option to **"Join Waitlist"**.
   - Waitlisted status is shown with a disabled button if already joined.

---

### Unit Tests

Added new unit tests using **Vitest + React Testing Library**:

- `EventList.test.jsx`: Covers rendering, RSVP/cancel, and capacity logic.
- `SearchEventList.test.jsx`: Tests event filtering based on search.
- `EventComments.test.jsx`: Ensures comments are conditionally rendered and toggled.
- `WaitList.test.jsx`: Tests "Join Waitlist" logic and button visibility.

---

### Cypress E2E Tests

Wrote robust Cypress tests to validate key user flows:

- `waitlist.cy.js`: Mocks full-capacity event to test waitlist functionality
- `comments.cy.js`: Tests loading and toggling of comments for events
- `search.cy.js`: Filters events using search input

---


### How to Run the Application & Tests

#### Run the Frontend App
```bash
npm install
npm run dev
```
Make sure your backend is running on **http://localhost:8080**

#### Run Unit Tests with Vitest
```bash
npx vitest
```

#### Run Cypress Tests (E2E)
```bash
npx cypress open
```

Then choose a spec like `event_create.cy.js` or `comments.cy.js` and click **Run**.




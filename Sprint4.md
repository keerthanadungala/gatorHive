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


## Backend Sprint 4 
In this sprint, the following tasks were completed:

**Implemented Comment Functionality**

1. **Create Comment API:**
    - Endpoint: POST /events/{id}/comments
    - Requires a valid JWT in Authorization: Bearer <token>.
    - Extracts the user_id from the token, decodes the JSON body { "comment": "<text>" }, and creates a new comment linked to both the user and the event.
    - Returns the newly created comment (including the commenter’s id, name, and email) in JSON.

2. **List Comments API:**
    - Endpoint: GET /events/{id}/comments
    - Publicly accessible.
    - Retrieves all comments for the given event, ordered by creation time, and includes each commenter’s user record.

3. **Delete Comment API:**
    - Endpoint: DELETE /comments/{id}
    - Publicly accessible (no auth checks).
    - Deletes the comment with the specified ID and returns a confirmation message.

**Implemented Waitlist Functionality**
    -Endpoint: POST /events/{id}/waitlist
    -Puts user on a waitlist if the event is at capacity. 
    -Promotes first user on waitlist to RSVP when a user cancels. And moves the next user in the queue to the front.
    -Prevents duplicate waitlist entries.

**Implemented Event Notifications by email**
    -RSVP Confirmation: Upon RSVP, a confirmation email is sent to the user with event details.
    -RSVP Cancellation: On cancelling an RSVP, the user receives a cancellation email.
    -Emails are sent asynchronously using Go routines.
    -Email is configured using Gmail SMTP via net/smtp.

**Modified RSVP to send emails**
    -POST /events/{id}/rsvp: Registers user if slots available and email matches token.
    -POST /events/{id}/cancel-rsvp: Cancels RSVP, triggers email, promotes waitlisted user.
    -Included capacity field

## Unit Tests for Backend
Below are the unit tests added for this sprint:

1. **TestCreateComment**
    Description: Tests if the POST /events/{id}/comments endpoint successfully creates a comment when given a valid JWT and content.
    Assertions:
    - HTTP status code 200 OK
    - Response body contains the new comment with fields:
        user_id matching the token’s user,
        event_id matching the URL,
        content matching the request,
        embedded user.name and user.email.

2. **TestGetComments**
    Description: Tests if the GET /events/{id}/comments endpoint returns all comments for an event in the correct order.
    Assertions:
    - HTTP status code 200 OK
    - Response body is a JSON array of comments, each with the expected content values in chronological order.

3. **TestDeleteComment**
    Description: Tests if the DELETE /comments/{id} endpoint deletes the specified comment and returns a success message.
    Assertions:
    - HTTP status code 200 OK
    - Response body contains { "message": "Comment deleted" }
    - The comment is removed from the database (zero results when querying by its ID).

4. **TestJoinWaitlist_Success**
    Description: Tests that a user can successfully join the waitlist for an event that has reached its capacity for the API /events/{id}/waitlist endpoint.
    Assertions:
    - HTTP status code 200 OK
    - Response body contains { "message": "Added to waitlist" }
    - A WaitlistEntry is created in the database for the given user and event.

5. **TestRSVP_EmailSent**
    Description: Verifies that an email is triggered when a user RSVPs to an event. A mock function replaces sendEmail to track invocation.
    Assertions:
    - RSVP is successful and returns 200 OK
    - Mock sendEmail is called
    - Email recipient matches the user's email
    - Email subject contains "RSVP"
    - rsvp_count in the response is 1
# GatorHive - Sprint 2 Completion Report


## Frontend Sprint 2 

- **Integrated Frontend And Backend**
- **Implemented Event Update & Delete Features** 
- **Wrote Cypress End-to-End Tests** 
- **Added Unit Tests using Vitest for Core Components** 

## Feature Enhancements

### 1) Implemented Event Update & Delete Features
In Sprint 2, users could create and view events. 
- **Update Event:** Users can now edit an existing event and save changes.
- **Delete Event:** Users can remove an event from both the frontend and the backend database.

### 2) Integrated Frontend And Backend
 - We also integrated both systems for event creation, event deletion, event update, view events.

## Testing Enhancements

### 3) Cypress End-to-End Testing
To validate UI interactions, we implemented **Cypress tests** covering:
- **createEvent.cy.js** – Tests event creation functionality.
- **updateEvent.cy.js** – Verifies event update feature.
- **deleteEvent.cy.js** – Ensures event deletion removes the event from UI.
- **navigation.cy.js** – Confirms correct navigation between pages.

**How to Run Cypress Tests**
1. Navigate to the project Frontend directory.
2. Install Cypress:
   ```bash
   npm install cypress --save-dev
   ```
3. Run Cypress tests using:
   ```bash
   npx cypress open
   ```
4. In the Cypress window, select a test file and run it.

 Running the Cypress test suite ensures the application functions correctly across multiple workflows.

### 4) Unit Testing with Vitest
To validate individual components, we wrote **Vitest unit tests** for:
- **EventList.test.js** – Checks if the event list renders correctly.
- **EventCreate.test.js** – Ensures event creation form functions properly.
- **EventUpdate.test.js** – Validates event update behavior.
- **Navbar.test.js** – Confirms the navigation bar renders and links work correctly.
- **App.test.js** – Ensures the main app component initializes correctly and routes work as expected.

**How to Run Vitest Unit Tests**
1. Navigate to the project Frontend directory.
2. Install Vitest:
   ```bash
   npm install vitest --save-dev
   ```
3. Run unit tests using:
   ```bash
   npx vitest
   ```
4. Check the test results in the terminal.

 Running the Vitest test suite confirms that components work in isolation and integrate correctly within the application.

## Backend Sprint 2 

In this sprint, the following tasks were completed:

1. Implemented Delete Event API
   - Added the DELETE /events/{id} endpoint to allow users to delete events by ID.
   - Integrated proper error handling for cases where the event does not exist.
   - Returned appropriate response codes and messages upon successful deletion.

2. Added Unit Tests for Backend
   - Created unit tests for all major backend APIs using the httptest package.
   - Used a mock SQLite database (:memory:) for testing to ensure test isolation and avoid modifying production data.
   - Implemented test cases for:
      GET /events - Fetch all events.
      POST /events - Create a new event.
      PUT /events/{id} - Update an existing event.
      DELETE /events/{id} - Delete an event by ID.
   - Ensured each test validates HTTP response codes, response body, and expected database changes.

## Unit Tests for Backend
Below are the unit tests added for Sprint 2:
1. TestGetEvents
Description: Tests if the GET /events endpoint retrieves a list of events.
Assertions:
HTTP status code 200 OK
Response body contains expected event details

2. TestCreateEvent
Description: Tests if the POST /events endpoint successfully creates a new event.
Assertions:
HTTP status code 200 OK
Response body contains the newly created event details

3. TestUpdateEvent
Description: Tests if the PUT /events/{id} endpoint updates an existing event.
Assertions:
HTTP status code 200 OK
Response body contains updated event details

4. TestDeleteEvent
Description: Tests if the DELETE /events/{id} endpoint successfully deletes an event.
Assertions:
HTTP status code 200 OK
Response body contains confirmation message









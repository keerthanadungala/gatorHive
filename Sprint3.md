# GatorHive - Sprint 3 Completion Report

## Frontend Sprint 3

## Features Implemented

### 1. Authentication System
- **Login**: Users can securely log in with email and password. JWT token is stored in `localStorage` and used in protected API requests.
- **Signup**: New users can register through the `/signup` route. Backend checks for email uniqueness and securely stores hashed passwords.
- **Logout**: Clears the stored JWT token, ending the user session securely.

### 2. Full Calendar View
- Integrated the `@fullcalendar/react` package.
- Displays events in a monthly grid format.
- Clicking an event opens a modal showing full details: title, time, location, and description.
- Events are fetched from the backend and correctly rendered.

### 3. RSVP Functionality
- Logged-in users can RSVP or cancel RSVP on events.
- The RSVP count updates optimistically on the frontend and is synchronized with backend confirmation.
- RSVP status (`userHasRSVP`) is remembered and correctly shown when users return or re-login.

## Frontend Unit Tests

We implemented and successfully ran unit tests for:

- **Login** – Tests form validation, token storage, and error handling on incorrect credentials.
- **Signup** – Checks form input and successful user registration flow.
- **EventList** – Confirms correct event rendering, RSVP toggling, and RSVP count logic.
- **CalendarView** – Tests that the calendar renders and shows events correctly.

##  How to Run

1. Navigate to the frontend project:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm run dev
   ```
4. Open your browser and go to:
   ```
   http://localhost:5173
   ```

###  Run Tests

To run all unit tests:
```bash
npm test
```



## Backend Sprint 3 

In this sprint, the following tasks were completed:

1. **Implemented Authentication APIs**
   - **Sign Up API:**  
     Added the `POST /signup` endpoint to allow new users to register by providing their name, email, and password.
   - **Login API:**  
     Added the `POST /login` endpoint for users to authenticate using their email and password. On successful login, a JWT token is returned.
   - **Logout API:**  
     Added the `POST /logout` endpoint which logs out the user by invalidating their JWT token (using an in‑memory blacklist).

2. **Implemented RSVP Functionality**
   - **RSVP API:**  
     Added the `POST /events/{id}/rsvp` endpoint so that logged-in users can RSVP to events.
     - The endpoint requires the client to send a JSON body containing the user’s email.
     - The email in the request body must match the email of the logged-in user (determined by the JWT token).
     - If the user hasn’t RSVPed already, an RSVP record is created; otherwise, a message indicating that the user has already RSVPed is returned.
     - The RSVP count for the event is returned as part of the response.

3. **Updated Event APIs to Include RSVP Count**
   - Modified the `GET /events` endpoint to include an `rsvp_count` field for each event, which reflects the total number of RSVPs for that event.

## Unit Tests for Backend

Below are the unit tests added for Sprint 2:

1. **TestSignUp**  
   *Description:* Tests if the `POST /signup` endpoint creates a new user.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains "User created successfully"

2. **TestLogin**  
   *Description:* Tests if the `POST /login` endpoint authenticates a user and returns a valid JWT token.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains a non-empty token

3. **TestLogout**  
   *Description:* Tests if the `POST /logout` endpoint successfully invalidates the JWT token.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains "Logout successful"  
   - The token is added to the in‑memory blacklist

4. **TestRSVP_Success**  
   *Description:* Tests if a valid RSVP request (with matching email) creates an RSVP record and returns the updated RSVP count.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains "RSVP successful" and `rsvp_count` equal to 1

5. **TestRSVP_AlreadyRSVPed**  
   *Description:* Tests if a duplicate RSVP request returns a message indicating the user has already RSVPed and the current RSVP count remains unchanged.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains "Already RSVPed" and correct `rsvp_count`

6. **TestRSVP_EmailMismatch**  
    *Description:* Tests if an RSVP request with an email that does not match the logged-in user's email is rejected.  
    *Assertions:*  
    - HTTP status code 401 Unauthorized  
    - Response body contains an appropriate error message

# GatorHive - Sprint 3 Completion Report

## Backend Sprint 2 

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

1. **TestGetEvents**  
   *Description:* Tests if the `GET /events` endpoint retrieves a list of events with the correct RSVP count.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains expected event details along with `rsvp_count`

2. **TestCreateEvent**  
   *Description:* Tests if the `POST /events` endpoint successfully creates a new event.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains the newly created event details

3. **TestUpdateEvent**  
   *Description:* Tests if the `PUT /events/{id}` endpoint updates an existing event.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains updated event details

4. **TestDeleteEvent**  
   *Description:* Tests if the `DELETE /events/{id}` endpoint successfully deletes an event.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains a confirmation message

5. **TestSignUp**  
   *Description:* Tests if the `POST /signup` endpoint creates a new user.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains "User created successfully"

6. **TestLogin**  
   *Description:* Tests if the `POST /login` endpoint authenticates a user and returns a valid JWT token.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains a non-empty token

7. **TestLogout**  
   *Description:* Tests if the `POST /logout` endpoint successfully invalidates the JWT token.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains "Logout successful"  
   - The token is added to the in‑memory blacklist

8. **TestRSVP_Success**  
   *Description:* Tests if a valid RSVP request (with matching email) creates an RSVP record and returns the updated RSVP count.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains "RSVP successful" and `rsvp_count` equal to 1

9. **TestRSVP_AlreadyRSVPed**  
   *Description:* Tests if a duplicate RSVP request returns a message indicating the user has already RSVPed and the current RSVP count remains unchanged.  
   *Assertions:*  
   - HTTP status code 200 OK  
   - Response body contains "Already RSVPed" and correct `rsvp_count`

10. **TestRSVP_EmailMismatch**  
    *Description:* Tests if an RSVP request with an email that does not match the logged-in user's email is rejected.  
    *Assertions:*  
    - HTTP status code 401 Unauthorized  
    - Response body contains an appropriate error message
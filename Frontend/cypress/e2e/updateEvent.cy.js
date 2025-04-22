describe("Update Event (Mocked + Logged In)", () => {
  beforeEach(() => {

    window.localStorage.setItem("jwt_token", "mock-token");
    window.localStorage.setItem("user_email", "testuser@example.com");


    cy.intercept("GET", "http://localhost:8080/events", {
      statusCode: 200,
      body: [
        {
          ID: 1,
          title: "Mock Event",
          date: "2025-06-01T12:00:00",
          location: "Mock Hall",
          description: "Mock event description",
          rsvp_count: 10,
          capacity: 100,
          user_has_rsvp: false,
          user_on_waitlist: false,
        },
      ],
    }).as("loadEvents");


    cy.intercept("GET", "http://localhost:8080/events/1", {
      statusCode: 200,
      body: {
        ID: 1,
        title: "Mock Event",
        date: "2025-06-01T12:00:00",
        location: "Mock Hall",
        description: "Mock event description",
        capacity: 100,
      },
    }).as("getEventDetails");


    cy.intercept("PUT", "http://localhost:8080/events/1", {
      statusCode: 200,
      body: { message: "Event updated successfully" },
    }).as("updateEvent");


    cy.visit("http://localhost:5173/events");
    cy.wait("@loadEvents");
  });

  it("should update an existing event with all fields", () => {

    cy.contains(".event-card", "Mock Event").within(() => {
      cy.contains("Edit").click();
    });


    cy.get('input[name="title"]').clear().type("Updated Mock Event");
    cy.get('input[name="date"]').clear().type("2025-06-15");
    cy.get('input[name="time"]').clear().type("14:00");
    cy.get('input[name="location"]').clear().type("Updated Location");
    cy.get('input[name="capacity"]').clear().type("150");
    cy.get('textarea[name="description"]').clear().type("Updated description using Cypress.");


    cy.get(".submit-btn").click();
    cy.wait("@updateEvent");


    cy.url().should("include", "/events");
    cy.contains(".event-card", "Mock Event").should("exist"); 
  });
});




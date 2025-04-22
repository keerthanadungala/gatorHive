describe("Delete Event", () => {
  beforeEach(() => {
    window.localStorage.setItem("jwt_token", "mock-token");
    window.localStorage.setItem("user_email", "test@ufl.edu");

    cy.intercept("GET", "http://localhost:8080/events", {
      statusCode: 200,
      body: [
        {
          ID: 123,
          title: "Cypress Delete Event",
          date: "2025-06-01T10:00:00",
          location: "Zoom",
          description: "This event will be deleted",
          rsvp_count: 1,
          capacity: 5,
          user_has_rsvp: false,
          user_on_waitlist: false
        }
      ]
    }).as("loadEvents");

    cy.intercept("DELETE", "http://localhost:8080/events/123", {
      statusCode: 200
    }).as("deleteEvent");

    cy.visit("http://localhost:5173/events");
    cy.wait("@loadEvents");
  });

  it("should delete an existing event", () => {

    cy.window().then((win) => {
      cy.stub(win, "confirm").returns(true);
    });


    cy.contains(".event-card", "Cypress Delete Event").within(() => {
      cy.get(".delete-btn").click();
    });


    cy.wait("@deleteEvent");


    cy.contains(".event-card", "Cypress Delete Event").should("not.exist");
  });
});



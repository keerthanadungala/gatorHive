describe("Waitlist Feature", () => {
    beforeEach(() => {
      localStorage.setItem("jwt_token", "mock-token");
      localStorage.setItem("user_email", "test@ufl.edu");
  
      cy.intercept("GET", "http://localhost:8080/events", {
        fixture: "events.json",
      }).as("getEvents");
  
      cy.visit("/events");
      cy.wait("@getEvents");
    });
  
    it("shows 'Join Waitlist' button and handles the click", () => {
      cy.intercept("POST", "http://localhost:8080/events/1/waitlist", {
        statusCode: 200,
        body: { message: "Added to waitlist" },
      }).as("joinWaitlist");
  
      cy.contains("Join Waitlist").should("be.visible").click();
      cy.wait("@joinWaitlist");
      cy.contains("On Waitlist").should("exist");
    });
  });
  
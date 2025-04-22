describe("Comments Feature", () => {
    beforeEach(() => {
      window.localStorage.setItem("jwt_token", "mock-token");
      window.localStorage.setItem("user_email", "test@ufl.edu");
  
      cy.intercept("GET", "http://localhost:8080/events", {
        statusCode: 200,
        body: [
          {
            ID: 4,
            title: "Commented Event",
            date: "2025-08-01T17:00:00",
            location: "Zoom",
            description: "Event with comments",
            rsvp_count: 10,
            capacity: 50,
            user_has_rsvp: false
          }
        ]
      }).as("mockedEvents");
  
      cy.intercept("GET", "http://localhost:8080/events/4/comments", {
        statusCode: 200,
        body: [
          { comment: "Excited for this!", email: "test@ufl.edu" }
        ]
      }).as("mockedComments");
  
      cy.visit("http://localhost:5173/events");
      cy.wait("@mockedEvents");
    });
  
    it("should load and toggle comments for an event", () => {
      cy.contains("Commented Event").should("exist");
      cy.contains("💬 Show Comments").click();
      cy.wait("@mockedComments");
  
      cy.contains("Excited for this!").should("be.visible");
  
      cy.contains("💬 Hide Comments").click();
      cy.contains("Excited for this!").should("not.exist");
    });
  });
  
  
  
  
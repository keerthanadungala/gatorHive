describe("Search Functionality", () => {
    beforeEach(() => {
      localStorage.setItem("jwt_token", "mock-token");
      localStorage.setItem("user_email", "test@ufl.edu");
  
      cy.intercept("GET", "http://localhost:8080/events", {
        fixture: "events.json",
      }).as("getEvents");
  
      cy.visit("/events");
      cy.wait("@getEvents");
    });
  
    it("filters events using search input", () => {
      cy.get("input[placeholder='🔍 Search events...']").type("AI Workshop");
      cy.contains("AI Workshop").should("be.visible");
      cy.contains("Gator Hackathon").should("not.exist");
    });
  });
  
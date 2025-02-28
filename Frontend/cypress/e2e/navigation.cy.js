describe("Navigation", () => {
    beforeEach(() => {
      cy.visit("http://localhost:5173"); 
    });
  
    it("should navigate to the Create Event page", () => {
      cy.contains("Create Event").click();
      cy.url().should("include", "/create");
      cy.contains("Create a New Gator Event").should("exist");
    });
  
    it("should navigate to the View Events page", () => {
      cy.contains("View Events").click();
      cy.url().should("include", "/events");
      cy.contains("📋 Upcoming Gator Events").should("exist");
    });
  
    it("should navigate back to Home", () => {
      cy.contains("Home").click();
      cy.url().should("eq", "http://localhost:5173/");
      cy.contains("Welcome to GatorHive").should("exist");
    });
  });
  
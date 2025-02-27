describe("Event Creation", () => {
    it("should allow a user to create an event", () => {
      // Visit the home page
      cy.visit("http://localhost:5173");
  
      // Click on the "Create Event" link
      cy.contains("Create Event").click();
  
      // Fill in the event form
      cy.get('input[name="title"]').type("Cypress Test Event");
      cy.get('input[name="date"]').type("2025-06-15");
      cy.get('input[name="time"]').type("10:00");
      cy.get('input[name="location"]').type("UF Test Hall");
      cy.get('textarea[name="description"]').type("This is a test event created using Cypress.");
  
      // Submit the form
      cy.get(".submit-btn").click();
  
      // Check for success message
      cy.contains("🎉 Event created successfully!").should("be.visible");
    });
  });
  
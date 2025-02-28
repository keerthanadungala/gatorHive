describe("Delete Event", () => {
    beforeEach(() => {
      cy.visit("http://localhost:5173/events"); // Navigate to events page
    });
  
    it("should delete an existing event", () => {
      cy.get(".event-card").first().within(() => {
        cy.contains("Delete").click(); // Click on the Delete button
      });
  
      // Confirm the deletion if there's a confirmation popup
      cy.on("window:confirm", () => true);
  
      // Ensure the event is no longer in the list
      cy.get(".event-card").should("have.length.lessThan", 3); // Assuming there were initially 3 events
    });
  });
  
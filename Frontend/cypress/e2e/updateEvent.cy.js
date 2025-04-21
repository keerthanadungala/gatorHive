describe("Update Event", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/events"); // Navigate to event list
  });

  it("should update an existing event with all fields", () => {
    // Wait for event cards to load
    cy.get(".event-card").should("have.length.greaterThan", 0);

    // Click the Edit button of the first event
    cy.get(".event-card").first().within(() => {
      cy.contains("Edit").click();
    });

    // Fill in updated values
    cy.get('input[name="title"]').clear().type("Updated Event Title");
    cy.get('input[name="date"]').clear().type("2025-05-10");
    cy.get('input[name="time"]').clear().type("12:30");
    cy.get('input[name="location"]').clear().type("Updated Location Hall");
    cy.get('input[name="capacity"]').clear().type("300");
    cy.get('textarea[name="description"]').clear().type("This event has been fully updated using Cypress.");

    // Submit the form
    cy.get(".submit-btn").click();

    // Verify redirection to event list
    cy.url().should("include", "/events");

    // Verify updated event appears in the list
    cy.contains(".event-card", "Updated Event Title", { timeout: 5000 }).should("exist");
  });
});

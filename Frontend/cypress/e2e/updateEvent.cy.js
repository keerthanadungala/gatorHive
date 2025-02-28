describe("Update Event", () => {
  beforeEach(() => {
      cy.visit("http://localhost:5173/events"); // Navigate to events page
  });

  it("should update an existing event", () => {
      // Ensure event cards are loaded before interacting
      cy.get(".event-card").should("have.length.greaterThan", 0);

      // Click the edit button inside the first event card
      cy.get(".event-card").first().within(() => {
          cy.contains("Edit").click();
      });

      // Wait for the update form to be visible
      cy.get('input[name="title"]').should("be.visible").clear().type("Updated Event Title");

      // Handle date field (Explicitly clear and set a valid date)
      cy.get('input[name="date"]')
        .should("be.visible")
        .clear()
        .type("2025-05-10") // Use YYYY-MM-DD format (recognized by HTML date inputs)
        .should("have.value", "2025-05-10"); // Ensure the date was set correctly

      // Handle time field
      cy.get('input[name="time"]')
        .clear()
        .type("12:30") // Ensure format is HH:mm
        .should("have.value", "12:30");

      // Handle location field
      cy.get('input[name="location"]').clear().type("New Location");

      // Handle description field
      cy.get('textarea[name="description"]').clear().type("Updated event details.");

      // Submit the update form
      cy.get(".submit-btn").click();

      // Wait for redirection and the event list to be reloaded
      cy.url().should("include", "/events");

      // Ensure that the updated event title appears in the event list
      cy.contains(".event-card", "Updated Event Title", { timeout: 5000 }).should("exist");
  });
});

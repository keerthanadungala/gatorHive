describe("Event Creation", () => {
  it("should allow a user to create an event with all fields", () => {

    cy.visit("http://localhost:5173", {
      onBeforeLoad(win) {
        win.localStorage.setItem("jwt_token", "mock-token");
        win.localStorage.setItem("user_email", "test@ufl.edu");
      },
    });


    cy.contains("CreateEvent").should("be.visible").click();


    cy.get('input[name="title"]').type("Cypress Test Event");
    cy.get('input[name="date"]').type("2025-06-15");
    cy.get('input[name="time"]').type("10:00");
    cy.get('input[name="location"]').type("UF Test Hall");
    cy.get('input[name="capacity"]').type("150");
    cy.get('textarea[name="description"]').type("This is a test event created using Cypress.");


    cy.get(".submit-btn").click();


    cy.contains("🎉 Event created successfully!").should("be.visible");
  });
});




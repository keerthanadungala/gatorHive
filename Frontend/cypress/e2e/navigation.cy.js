describe("Navigation", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173", {
      onBeforeLoad(win) {
        win.localStorage.setItem("jwt_token", "mock-token");
        win.localStorage.setItem("user_email", "testuser@ufl.edu");
      },
    });
  });

  it("should navigate to the Create Event page", () => {
    cy.contains("CreateEvent").should("be.visible").click();
    cy.url().should("include", "/create");
    cy.contains("Create a New Gator Event").should("exist");
  });

  it("should navigate to the View Events page", () => {
    cy.contains("ViewEvents").should("be.visible").click();
    cy.url().should("include", "/events");
    cy.contains("📋 Upcoming Gator Events").should("exist");
  });

  it("should navigate to the Calendar page", () => {
    cy.contains("Calendar").should("be.visible").click();
    cy.url().should("include", "/calendar");
    cy.contains("📆 GatorHive Calendar").should("exist");
  });

  it("should navigate back to Home", () => {
    cy.contains("Home").should("be.visible").click();
    cy.url().should("eq", "http://localhost:5173/");
    cy.contains("Welcome to GatorHive").should("exist");
  });

  it("should log out and redirect to login page", () => {
    cy.get(".logout-btn").should("be.visible").click();
    cy.url().should("include", "/login");
    cy.contains("Login").should("exist");
  });
});




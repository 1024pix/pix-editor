/// <reference types="cypress" />

context('Visiting homepage', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4300');
  })

  it('authenticates', () => {
    cy.get('#login-api-key')
      .type('8d03a893-3967-4501-9dc4-e0aa6c6dc442{enter}');
  })
})


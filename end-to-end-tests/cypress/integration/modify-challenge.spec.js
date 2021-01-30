/// <reference types="cypress" />


context('Modifying challenge', () => {

  it('Modifies a challenge', () => {
    // given
    cy.visit('http://localhost:4300');
    cy.get('#login-api-key')
      .type('8d03a893-3967-4501-9dc4-e0aa6c6dc442{enter}');
    cy.contains('1. Information', {timeout: 30000}).click();
    cy.contains('1.1').click()
    cy.contains('@eval2', {timeout: 12000}).click();
    cy.contains('Modifier').click();
    cy.contains('Enregistrer').click();
    cy.intercept('POST', '/api/**').as('route');

    // when
    cy.contains('Enregistrer', {timeout: 2000}).click();

    // then
    cy.wait('@route').its('response.statusCode').should('be.within', 200, 204);
  });

});


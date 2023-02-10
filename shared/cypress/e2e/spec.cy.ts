describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Koululentovaraus');
    cy.contains('Varauskalenteri');
    cy.get('div.fc-view-harness').contains('perjantai');
  });
});

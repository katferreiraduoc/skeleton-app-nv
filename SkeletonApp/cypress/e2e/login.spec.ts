describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('muestra el título correcto', () => {
    cy.get('ion-header h1').should('contain.text', 'Mi Identidad');
  });
});

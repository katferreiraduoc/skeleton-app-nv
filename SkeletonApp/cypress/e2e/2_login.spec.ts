describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('debe mostrar el título en el header', () => {
    cy.get('ion-header h1', { includeShadowDom: true })
      .should('contain.text', 'Mi Identidad');
  });

  it('login válido muestra toast y redirige a Home', () => {
    cy.get('ion-input[data-cy="usuario-input"] input', { includeShadowDom: true })
      .type('katmini');
    cy.get('ion-input[data-cy="clave-input"] input', { includeShadowDom: true })
      .type('1234');

    cy.get('ion-button', { includeShadowDom: true })
      .contains('Ingresar')
      .click();

    cy.get('ion-toast', { includeShadowDom: true, timeout: 10000 })
      .should('exist');

    cy.get('ion-toast', { includeShadowDom: true })
      .shadow()
      .find('.toast-message')
      .should('contain.text', 'Login Exitoso');

    cy.url({ timeout: 10000 })
      .should('include', '/home');
  });

  it('login inválido muestra alerta', () => {
    cy.get('ion-input[data-cy="usuario-input"] input', { includeShadowDom: true })
      .type('x');
    cy.get('ion-input[data-cy="clave-input"] input', { includeShadowDom: true })
      .type('0000');

    cy.get('ion-button', { includeShadowDom: true })
      .contains('Ingresar')
      .click();

    cy.get('ion-alert', { includeShadowDom: true })
      .should('exist');
  });
});

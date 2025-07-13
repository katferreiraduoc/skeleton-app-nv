describe('01 Registro de usuario', () => {
  beforeEach(() => {
    cy.visit('/registro')
  })

  it('puede registrar un nuevo usuario y navegar al home', () => {
    cy.get('ion-input[data-cy="registro-user"] input', { includeShadowDom: true })
      .type('katmini')

    cy.get('ion-input[data-cy="registro-pass"] input', { includeShadowDom: true })
      .type('1234')

    cy.get('ion-button[data-cy="registro-submit"]', { includeShadowDom: true })
      .click()

    cy.get('ion-alert', { includeShadowDom: true })
      .should('be.visible')

    cy.get('ion-alert .alert-message', { includeShadowDom: true })
      .should('contain.text', 'Cuenta creada para katmini')

    cy.get('ion-alert button', { includeShadowDom: true })
      .click()

    cy.url().should('include', '/home')
  })
})

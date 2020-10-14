import { selectors, text, url } from '../constants/PoliciesPage';
import * as api from '../constants/apiEndpoints';
import withAuth from '../helpers/basicAuth';
import DndSimulatorDataTransfer from '../helpers/dndSimulatorDataTransfer';

const NUM_POLICY_CATEGORIES = 8;

describe('Policies page', () => {
    withAuth();

    beforeEach(() => {
        cy.server();
        cy.fixture('search/metadataOptions.json').as('metadataOptionsJson');
        cy.route('GET', api.search.options, '@metadataOptionsJson').as('metadataOptions');
        cy.visit(url);
        cy.wait('@metadataOptions');
    });

    const addPolicy = () => {
        cy.get(selectors.newPolicyButton).click();
    };

    const editPolicy = () => {
        cy.get(selectors.editPolicyButton).click();
    };

    const closePolicySidePanel = () => {
        cy.get(selectors.cancelButton).click();
    };

    const goToNextWizardStage = () => {
        cy.get(selectors.nextButton).click();
    };

    const goToPrevWizardStage = () => {
        cy.get(selectors.prevButton).click();
    };

    const savePolicy = () => {
        // Next will dryrun and show the policy effects preview.
        cy.route('POST', api.policies.dryrun).as('dryrunPolicy');
        goToNextWizardStage();
        cy.wait('@dryrunPolicy');
        // Next will now take you to the enforcement page.
        goToNextWizardStage();
        // Save will PUT the policy (assuming it is not new), then GET it.
        cy.route('PUT', api.policies.policy).as('savePolicy');
        cy.route('GET', api.policies.policy).as('getPolicy');
        cy.get(selectors.savePolicyButton).click();
        cy.wait('@savePolicy');
        cy.wait('@getPolicy');
    };

    describe('basic tests', () => {
        it('should navigate using the left nav', () => {
            cy.visit('/');
            cy.get(selectors.configure).click();
            cy.get(selectors.navLink).click({ force: true });
            cy.location('pathname').should('eq', url);
        });

        it('should display and send a query using the search input', () => {
            cy.route('/v1/policies?query=Category:DevOps Best Practices').as('newSearchQuery');
            cy.get(selectors.searchInput).type('Category:{enter}');
            cy.get(selectors.searchInput).type('DevOps Best Practices{enter}');
            cy.wait('@newSearchQuery');
            cy.get(selectors.searchInput).type('{backspace}{backspace}');
            cy.route('/v1/policies?query=Cluster:remote').as('newSearchQuery');
            cy.get(selectors.searchInput).type('Cluster:{enter}');
            cy.get(selectors.searchInput).type('remote{enter}');
            cy.wait('@newSearchQuery');
        });

        it('should show the required "*" next to the required fields', () => {
            addPolicy();
            cy.get(selectors.form.required).eq(0).prev().should('have.text', 'Name');
            cy.get(selectors.form.required).eq(1).prev().should('have.text', 'Severity');
            cy.get(selectors.form.required).eq(2).prev().should('have.text', 'Lifecycle Stages');
            cy.get(selectors.form.required).eq(3).prev().should('have.text', 'Categories');
        });

        it('should have selected item in nav bar', () => {
            cy.get(selectors.configure).should('have.class', 'bg-primary-700');
        });

        it('should open side panel and check for the policy name', () => {
            cy.get(selectors.tableFirstRowName)
                .invoke('text')
                .then((name) => {
                    cy.get(selectors.tableFirstRow).click({ force: true });
                    cy.get(selectors.sidePanel).should('exist');
                    cy.get(selectors.sidePanelHeader).contains(name);
                });
        });

        it('should allow updating policy name', () => {
            const updatePolicyName = (typeStr) => {
                editPolicy();
                cy.get(selectors.tableContainer).should('have.class', 'pointer-events-none');
                cy.get(selectors.form.nameInput).type(typeStr);
                goToNextWizardStage();
                savePolicy();
            };
            const secretSuffix = ':secretSuffix:';
            const deleteSuffix = '{backspace}'.repeat(secretSuffix.length);

            cy.get(selectors.tableFirstRow).click({ force: true });
            updatePolicyName(secretSuffix);
            cy.get(`.rt-tr:contains("${secretSuffix}")`);
            updatePolicyName(deleteSuffix); // revert back
        });

        it('should not allow getting a dry run when creating a policy with a duplicate name', () => {
            addPolicy();
            cy.get(selectors.form.nameInput).type(text.policyLatestTagName);
            goToNextWizardStage();
            goToNextWizardStage();
            cy.get(selectors.booleanPolicySection.addPolicySectionBtn).should('exist');
        });

        it('should show dry run loading screen before showing dry run results', () => {
            cy.get(selectors.tableFirstRow).click({ force: true });
            editPolicy();
            goToNextWizardStage();
            goToNextWizardStage();
            cy.get(selectors.policyPreview.loading).should('exist');
            closePolicySidePanel();
        });

        it('should open the preview panel to view policy dry run', () => {
            cy.get(selectors.tableFirstRow).click({ force: true });
            editPolicy();
            goToNextWizardStage();
            goToNextWizardStage();

            cy.get(selectors.policyPreview.loading).should('exist');
            cy.wait(2000);

            cy.get('.warn-message').should('exist');
            cy.get('.alert-preview').should('exist');
        });

        it('should open the panel to create a new policy', () => {
            addPolicy();
            cy.get(selectors.nextButton).should('exist');
        });

        it('should show a specific message when editing a policy with "enabled" value as "no"', () => {
            cy.get(selectors.policies.disabledPolicyImage).click({ force: true });
            editPolicy();
            goToNextWizardStage();
            goToNextWizardStage();
            cy.get(selectors.policyPreview.message).should('have.text', text.policyPreview.message);
        });

        // TODO(ROX-1580): Re-enable this test.
        xit('should de-highlight a row on panel close', () => {
            // Select a row.
            cy.route('GET', api.policies.policy).as('getPolicy');
            cy.get(selectors.policies.scanImage).click({ force: true });
            cy.wait('@getPolicy'); // Wait for the panel to be loaded before closing.

            // Check that the row is active and highlighted
            cy.get(selectors.policies.scanImage).should('have.class', 'row-active');

            // Close the side panel.
            closePolicySidePanel();

            // Check that it is no longer active and highlighted.
            cy.get(selectors.policies.scanImage).should('not.have.class', 'row-active');
        });

        it('should have details panel open on page refresh', () => {
            // Select a row.
            cy.get(selectors.policies.scanImage).click({ force: true });

            // Reload the page with that row's id in the URL.
            cy.get(selectors.policyDetailsPanel.idValueDiv)
                .invoke('text')
                .then((idValue) => {
                    cy.visit(url.concat('/', idValue));
                });

            // Check that the side panel is open.
            cy.get(selectors.cancelButton).should('exist');
        });

        it('should show Add Capabilities value in edit mode', () => {
            cy.get(selectors.policies.addCapabilities).click({ force: true });
            editPolicy();
            goToNextWizardStage();
            cy.get(selectors.form.selectValue).contains('SYS_ADMIN');
        });

        // TODO: (ROX-3373) make this test work with updated babel and cypress versions
        it.skip('should allow disable/enable policy from the policies table', () => {
            // initialize to have enabled policy
            cy.get(selectors.enableDisableIcon)
                .first()
                .then((icon) => {
                    if (!icon.hasClass(selectors.enabledIconColor)) {
                        cy.get(selectors.hoverActionButtons).first().click({ force: true });
                    }
                });

            // force click the first enable/disable button on the first row
            cy.get(selectors.hoverActionButtons).first().click({ force: true });

            cy.get(selectors.enableDisableIcon)
                .first()
                .should('not.have.class', selectors.enabledIconColor);
            cy.get(selectors.tableFirstRow).click({ force: true });
            cy.get(selectors.policyDetailsPanel.enabledValueDiv).should('contain', 'No');

            cy.get(selectors.hoverActionButtons).first().click({ force: true }); // enable policy
            cy.get(selectors.policyDetailsPanel.enabledValueDiv).should('contain', 'Yes');
            cy.get(selectors.enableDisableIcon)
                .first()
                .should('have.class', selectors.enabledIconColor);
        });

        it.skip('should show actions menu when the checkboxes are chosen', () => {
            cy.get(selectors.reassessAllButton).should('be.visible');
            cy.get(selectors.newPolicyButton).should('be.visible');
            cy.get(selectors.checkbox1).click({ force: true });
            cy.get(selectors.actionsButton).click();
            cy.get('button[data-testid="Delete Policies"]').should('be.visible');
            cy.get('button[data-testid="Enable Notification"]').should('be.visible');
            cy.get('button[data-testid="Disable Notification"]').should('be.visible');
            cy.get(selectors.reassessAllButton).should('not.exist');
            cy.get(selectors.newPolicyButton).should('not.exist');
        });

        it('should delete a policy when the hover delete policy clicked', () => {
            cy.get(selectors.tableFirstRow).click({ force: true });
            cy.get(selectors.sidePanel).should('exist');
            cy.get(selectors.tableFirstRowName)
                .invoke('text')
                .then((policyName) => {
                    cy.get(selectors.tableFirstRow).should('contain', policyName);
                    cy.get(selectors.hoverActionButtons).eq(1).click({ force: true });
                    cy.get(selectors.tableFirstRow).should('not.contain', policyName);
                    cy.get(selectors.tableFirstRow).click({ force: true });
                    cy.get(selectors.sidePanel).should('exist');
                    cy.get(selectors.sidePanelHeader).should('not.have.text', policyName);
                });
        });

        it('should allow creating new categories and saving them (ROX-1409)', () => {
            const categoryName = 'ROX-1409-test-category';
            cy.get(selectors.tableFirstRow).click({ force: true });
            editPolicy();
            cy.get(selectors.categoriesField.input).type(`${categoryName}{enter}`);
            goToNextWizardStage();
            savePolicy();
            cy.get(selectors.policyDetailsPanel.detailsSection).should('contain', categoryName);

            // now edit same policy, the previous category should exist in the list
            editPolicy();
            cy.get(
                `${selectors.categoriesField.valueContainer} > div:contains(${categoryName}) > div.react-select__multi-value__remove`
            ).click(); // remove it
            goToNextWizardStage();
            savePolicy();
            cy.get(selectors.policyDetailsPanel.detailsSection).should('not.contain', categoryName);
        });
    });

    describe('policy import and export', () => {
        describe('policy export', () => {
            it('should start an API call to get the policy in the detail panel', () => {
                cy.route({
                    method: 'POST',
                    url: 'v1/policies/export',
                }).as('policyExport');

                cy.get(selectors.tableFirstRow).click();

                cy.url().then((href) => {
                    const segments = href.split('/');
                    const policyId = segments[segments.length - 1];
                    cy.get(selectors.singlePolicyExportButton).click();

                    cy.wait('@policyExport')
                        .its('request.body')
                        .should('deep.equal', {
                            policyIds: [policyId],
                        });
                });
            });

            it('should display an error when the export fails', () => {
                cy.route({
                    method: 'POST',
                    url: 'v1/policies/export',
                    status: 400,
                    response: {
                        message: 'Some policies could not be retrieved.',
                    },
                }).as('policyExport');

                cy.get(selectors.tableFirstRow).click();
                cy.get(selectors.singlePolicyExportButton).click();

                cy.wait('@policyExport');

                cy.get(selectors.toast).contains('Could not export the policy');
            });
        });

        describe('policy import', () => {
            it('should open the import dialog when button is clicked', () => {
                cy.get(selectors.importPolicyButton).click();

                cy.get(`${selectors.policyImportModal.content}:contains("JSON")`);
                cy.get(selectors.policyImportModal.uploadIcon);
                cy.get(selectors.policyImportModal.fileInput);
                cy.get(selectors.policyImportModal.confirm)
                    .should('be.disabled')
                    .invoke('text')
                    .then((btnText) => {
                        expect(btnText).to.contain('Import');
                    });

                cy.get(selectors.policyImportModal.cancel).click();
                cy.get(selectors.policyImportModal.content).should('not.exist');
            });

            it('should successfully import a policy', () => {
                cy.get(selectors.importPolicyButton).click();

                const fileName = 'policies/good_policy_to_import.json';
                cy.fixture(fileName).then((json) => {
                    const expectedPolicyName = json?.policies[0]?.name;
                    const expectedPolicyId = json?.policies[0]?.id;

                    // due to way Cypress handles JSON fixtures, we have to use this workaround to handle JSON file upload
                    //   https://github.com/abramenal/cypress-file-upload/issues/175#issue-586835434
                    const fileContent = JSON.stringify(json);
                    cy.get(selectors.policyImportModal.fileInput).upload({
                        fileContent,
                        fileName,
                        mimeType: 'application/json',
                        encoding: 'utf8',
                    });
                    cy.get(`${selectors.policyImportModal.policyNames}:first`)
                        .invoke('text')
                        .then((policyText) => {
                            expect(policyText).to.equal(expectedPolicyName);
                        });

                    cy.get(selectors.policyImportModal.confirm).click();

                    cy.get(selectors.policyImportModal.successMessage);

                    cy.location('pathname').should('eq', `${url}/${expectedPolicyId}`);
                });
            });

            it('should show error and handle resolution form when new policy has a duplicate name', () => {
                const mockDupeNameResponse = {
                    responses: [
                        {
                            succeeded: false,
                            policy: {
                                id: 'f09f8da1-6111-4ca0-8f49-294a76c65118',
                                name: 'Dupe Name Policy',
                                // other policy properties omitted from mock
                            },
                            errors: [
                                {
                                    message: 'Could not add policy due to name validation',
                                    type: 'duplicate_name',
                                    duplicateName: 'Dupe Name Policy',
                                },
                            ],
                        },
                    ],
                    allSucceeded: false,
                };
                cy.route({
                    method: 'POST',
                    url: 'v1/policies/import',
                    response: mockDupeNameResponse,
                }).as('dupeImportName');

                cy.get(selectors.importPolicyButton).click();

                const dummyJson = {
                    policies: [
                        {
                            name: 'Dupe Name Policy',
                        },
                    ],
                };
                const fileContent = JSON.stringify(dummyJson);
                cy.get(selectors.policyImportModal.fileInput).upload({
                    fileContent,
                    fileName: 'dummy.json',
                    mimeType: 'application/json',
                    encoding: 'utf8',
                });
                cy.get(selectors.policyImportModal.confirm).click();

                cy.wait('@dupeImportName');

                // check error state
                cy.get(selectors.policyImportModal.dupeNameMessage);
                cy.get(selectors.policyImportModal.confirm).should('be.disabled');

                // first, ensure there is an overwrite option
                cy.get(selectors.policyImportModal.overwriteRadioLabel).click();
                cy.get(selectors.policyImportModal.confirm).should('not.be.disabled');

                // next, ensure there is a rename option, and that it requires more info than just clicking
                cy.get(selectors.policyImportModal.renameRadioLabel).click();
                cy.get(selectors.policyImportModal.confirm).should('be.disabled');

                // finally, give a new name, and ensure we can again submit the policy
                cy.get(selectors.policyImportModal.newNameInputLabel)
                    .click()
                    .type('A whole new world');
                cy.get(selectors.policyImportModal.confirm).should('not.be.disabled');
            });

            it('should show error and handle resolution form when new policy has a duplicate ID', () => {
                const mockDupeNameResponse = {
                    responses: [
                        {
                            succeeded: false,
                            policy: {
                                id: 'f09f8da1-6111-4ca0-8f49-294a76c65117',
                                name: 'Fixable CVSS >= 9',
                                // other policy properties omitted from mock
                            },
                            errors: [
                                {
                                    message:
                                        'Policy Different than Fixable CVSS is >= 9 (f09f8da1-6111-4ca0-8f49-294a76c65117) cannot be added because it already exists',
                                    type: 'duplicate_id',
                                    duplicateName: 'Fixable CVSS >= 9',
                                },
                            ],
                        },
                    ],
                    allSucceeded: false,
                };
                cy.route({
                    method: 'POST',
                    url: 'v1/policies/import',
                    response: mockDupeNameResponse,
                }).as('dupeImportId');

                cy.get(selectors.importPolicyButton).click();

                const dummyJson = {
                    policies: [
                        {
                            name: 'Dupe ID Policy',
                        },
                    ],
                };
                const fileContent = JSON.stringify(dummyJson);
                cy.get(selectors.policyImportModal.fileInput).upload({
                    fileContent,
                    fileName: 'dummy.json',
                    mimeType: 'application/json',
                    encoding: 'utf8',
                });
                cy.get(selectors.policyImportModal.confirm).click();

                cy.wait('@dupeImportId');

                // check error state
                cy.get(selectors.policyImportModal.dupeIdMessage);
                cy.get(selectors.policyImportModal.confirm).should('be.disabled');

                // first, ensure there is an overwrite option
                cy.get(selectors.policyImportModal.overwriteRadioLabel).click();
                cy.get(selectors.policyImportModal.confirm).should('not.be.disabled');

                // finally, ensure there is a "keep both" option, and ensure we can again submit the policy
                cy.get(selectors.policyImportModal.keepBothRadioLabel).click();
                cy.get(selectors.policyImportModal.confirm).should('not.be.disabled');
            });

            it('should show error and handle resolution form when new policy has both duplicate name and duplicate ID', () => {
                const mockDupeNameResponse = {
                    responses: [
                        {
                            succeeded: false,
                            policy: {
                                id: '8ac93556-4ad4-4220-a275-3f518db0ceb9',
                                name: 'Fixable CVSS >= 9',
                                // other policy properties omitted from mock
                            },
                            errors: [
                                {
                                    message:
                                        'Policy Fixable CVSS >= 9 (8ac93556-4ad4-4220-a275-3f518db0ceb9) cannot be added because it already exists',
                                    type: 'duplicate_id',
                                    duplicateName: 'Container using read-write root filesystem',
                                },
                                {
                                    message: 'Could not add policy due to name validation',
                                    type: 'duplicate_name',
                                    duplicateName: 'Fixable CVSS >= 9',
                                },
                            ],
                        },
                    ],
                    allSucceeded: false,
                };
                cy.route({
                    method: 'POST',
                    url: 'v1/policies/import',
                    response: mockDupeNameResponse,
                }).as('dupeImportNameAndId');

                cy.get(selectors.importPolicyButton).click();

                const dummyJson = {
                    policies: [
                        {
                            name: 'Dupe Name and Dupe ID Policy',
                        },
                    ],
                };
                const fileContent = JSON.stringify(dummyJson);
                cy.get(selectors.policyImportModal.fileInput).upload({
                    fileContent,
                    fileName: 'dummy.json',
                    mimeType: 'application/json',
                    encoding: 'utf8',
                });
                cy.get(selectors.policyImportModal.confirm).click();

                cy.wait('@dupeImportNameAndId');

                // check error state
                cy.get(selectors.policyImportModal.dupeNameMessage);
                cy.get(selectors.policyImportModal.dupeIdMessage);
                cy.get(selectors.policyImportModal.confirm).should('be.disabled');

                // first, ensure there is an overwrite option
                cy.get(selectors.policyImportModal.overwriteRadioLabel).click();
                cy.get(selectors.policyImportModal.confirm).should('not.be.disabled');

                // next, ensure there is a rename option, and that it requires more info than just clicking
                cy.get(selectors.policyImportModal.renameRadioLabel).click();
                cy.get(selectors.policyImportModal.confirm).should('be.disabled');

                // finally, give a new name, and ensure we can again submit the policy
                cy.get(selectors.policyImportModal.newNameInputLabel)
                    .click()
                    .type('A policy by any other name would smell just as sweet');
                cy.get(selectors.policyImportModal.confirm).should('not.be.disabled');
            });
        });
    });

    describe('Boolean Policy Logic Section', () => {
        const dataTransfer = new DndSimulatorDataTransfer();

        const dragFieldIntoSection = (fieldSelector) => {
            cy.get(fieldSelector)
                .trigger('mousedown', {
                    which: 1,
                })
                .trigger('dragstart', {
                    dataTransfer,
                })
                .trigger('drag');
            cy.get(selectors.booleanPolicySection.policySectionDropTarget)
                .trigger('dragover', {
                    dataTransfer,
                })
                .trigger('drop', {
                    dataTransfer,
                })
                .trigger('dragend', {
                    dataTransfer,
                })
                .trigger('mouseup', {
                    which: 1,
                });
        };

        const addPolicySection = () => {
            cy.get(selectors.booleanPolicySection.addPolicySectionBtn).click();
        };

        const addPolicyFieldCard = (index) => {
            cy.get(selectors.booleanPolicySection.policyKey)
                .eq(index)
                .trigger('mousedown', { which: 1 })
                .trigger('dragstart', { dataTransfer })
                .trigger('drag');
            cy.get(selectors.booleanPolicySection.policySectionDropTarget)
                .trigger('dragover', { dataTransfer })
                .trigger('drop', { dataTransfer })
                .trigger('dragend', { dataTransfer })
                .trigger('mouseup', { which: 1 });
        };

        const clickPolicyKeyGroup = (categoryName) => {
            cy.get(
                `${selectors.booleanPolicySection.policyKeyGroup}:contains(${categoryName}) ${selectors.booleanPolicySection.collapsibleBtn}`
            ).click();
        };

        describe('Single Policy Field Card', () => {
            beforeEach(() => {
                addPolicy();
                goToNextWizardStage();
                addPolicySection();
            });
            it('should add multiple Field Values for the same Field with an AND/OR operator between them when (+) is clicked', () => {
                // to mock BPL policy here, but for now
                addPolicyFieldCard(0);
                cy.get(selectors.booleanPolicySection.addPolicyFieldValueBtn).click();
                cy.get(selectors.booleanPolicySection.policyFieldValue).should((values) => {
                    expect(values).to.have.length(2);
                });
            });

            it('should allow floats for CPU and CVSS configuration fields', () => {
                // unfurl Container Configuration policy key group
                clickPolicyKeyGroup('Container Configuration');
                // first, select a CPU field
                dragFieldIntoSection(
                    `${selectors.booleanPolicySection.policyKey}:contains("Container CPU Request")`
                );

                cy.get(selectors.booleanPolicySection.form.selectArrow).first().click();
                cy.get(
                    `${selectors.booleanPolicySection.form.selectOption}:contains("Is equal to")`
                ).click();
                cy.get(selectors.booleanPolicySection.form.numericInput).click().type(2.2);

                // unfurl Image Contents policy field key group
                clickPolicyKeyGroup('Image Contents');
                // second, select CVSS field
                dragFieldIntoSection(
                    `${selectors.booleanPolicySection.policyKey}:contains("CVSS")`
                );

                cy.get(selectors.booleanPolicySection.form.selectArrow).last().click();
                cy.get(
                    `${selectors.booleanPolicySection.form.selectOption}:contains("Is greater than or equal to")`
                ).click();
                cy.get(`${selectors.booleanPolicySection.form.numericInput}:last`)
                    .click()
                    .type(7.5);
            });

            it('should allow updating image fields in a policy', () => {
                cy.get(selectors.policies.scanImage).click({
                    force: true,
                });
                editPolicy();
                goToNextWizardStage();

                // first, drag in an image field
                dragFieldIntoSection(
                    `${selectors.booleanPolicySection.policyKey}:contains("Image Registry")`
                );

                // second, add a value to it
                cy.get(`${selectors.booleanPolicySection.form.textInput}:last`)
                    .click()
                    .clear()
                    .type('docker.io');
                savePolicy();

                // third, check that the new field and its value saved successfully
                cy.get(`${selectors.booleanPolicySection.policyFieldCard}:last`).should(
                    'contain.text',
                    'Image pulled from registry:'
                );
                cy.get(`${selectors.booleanPolicySection.policyFieldCard}:last input`).should(
                    'have.value',
                    'docker.io'
                );

                // clean up, by removing the field we just added
                editPolicy();
                goToNextWizardStage();
                cy.get(`${selectors.booleanPolicySection.removePolicyFieldBtn}:last`).click();
                savePolicy();
            });

            it('should allow updating days since image scanned in a policy', () => {
                cy.get(selectors.policies.scanImage).click({
                    force: true,
                });
                editPolicy();
                goToNextWizardStage();

                // unfurl Image Contents Policy Key Group
                clickPolicyKeyGroup('Image Contents');
                // first, drag in an image scan age field
                dragFieldIntoSection(
                    `${selectors.booleanPolicySection.policyKey}:contains("Image Scan Age")`
                );

                // second, add a value to it
                cy.get(`${selectors.booleanPolicySection.form.numericInput}:last`)
                    .click()
                    .type('50');
                savePolicy();

                // third, check that the new field and its value saved successfully
                cy.get(`${selectors.booleanPolicySection.policyFieldCard}:last`).should(
                    'have.text',
                    'Minimum days since last image scan:'
                );
                cy.get(`${selectors.booleanPolicySection.policyFieldCard}:last input`).should(
                    'have.value',
                    '50'
                );

                // clean up, by removing the field we just added
                editPolicy();
                goToNextWizardStage();
                cy.get(`${selectors.booleanPolicySection.removePolicyFieldBtn}:last`).click();
                savePolicy();
            });

            it('should not allow multiple Policy Field Values for boolean Policy Fields', () => {
                // unfurl Container Configuration policy key group
                clickPolicyKeyGroup('Container Configuration');
                // to mock BPL policy here, but for now
                dragFieldIntoSection(
                    `${selectors.booleanPolicySection.policyKey}:contains("Root")`
                );

                cy.get(selectors.booleanPolicySection.addPolicyFieldValueBtn).should('not.exist');
            });

            it('should delete only the selected Policy Value from a Policy Field', () => {
                // to mock BPL policy here, but for now
                addPolicyFieldCard(0);
                cy.get(selectors.booleanPolicySection.addPolicyFieldValueBtn).click();
                cy.get(selectors.booleanPolicySection.removePolicyFieldValueBtn).eq(0).click();
                cy.get(selectors.booleanPolicySection.policyFieldValue).then((values) => {
                    expect(values).to.have.length(1);
                });
                cy.get(selectors.booleanPolicySection.removePolicyFieldValueBtn).should(
                    'not.exist'
                );
            });
        });

        describe('Single Policy Section', () => {
            beforeEach(() => {
                addPolicy();
                goToNextWizardStage();
                addPolicySection();
            });
            it('should populate a default Value input in a new Policy Section when dragging a Field Key', () => {
                cy.get(selectors.booleanPolicySection.policyFieldCard).should('not.exist');
                addPolicyFieldCard(0);
                cy.get(selectors.booleanPolicySection.policyFieldCard).should('exist');
                cy.get(selectors.booleanPolicySection.policyFieldValue).should('exist');
                cy.get(
                    `${selectors.booleanPolicySection.policySection} ${selectors.booleanPolicySection.andOrOperator}`
                ).should('contain', 'AND');
            });

            it('should AND the dragged Field when dragging a Field Key to a Policy Section that already has a Field ', () => {
                addPolicyFieldCard(0);
                addPolicyFieldCard(1);
                cy.get(selectors.booleanPolicySection.policyFieldValue).should((values) => {
                    expect(values).to.have.length(2);
                });

                cy.get(
                    `${selectors.booleanPolicySection.policySection} ${selectors.booleanPolicySection.andOrOperator}`
                ).should((andOrOperators) => {
                    expect(andOrOperators).to.have.length(2);
                });
            });

            it('should delete the Field from the Policy Section', () => {
                addPolicyFieldCard(0);
                cy.get(selectors.booleanPolicySection.policyFieldCard).should('exist');
                cy.get(selectors.booleanPolicySection.removePolicyFieldBtn).click();
                cy.get(selectors.booleanPolicySection.policyFieldCard).should('not.exist');
            });

            it('should not allow dragging a duplicate Field Key in the same Policy Section', () => {
                addPolicyFieldCard(0);
                addPolicyFieldCard(0);
                cy.get(selectors.booleanPolicySection.policyFieldValue).should((values) => {
                    expect(values).to.have.length(1);
                });
            });
        });

        describe('Boolean operator', () => {
            beforeEach(() => {
                addPolicy();
                goToNextWizardStage();
                addPolicySection();
            });
            it('should toggle to AND when OR is clicked if the Policy Field can be ANDed', () => {
                addPolicyFieldCard(0);
                cy.get(selectors.booleanPolicySection.addPolicyFieldValueBtn).click();
                const policyFieldCardAndOrOperator = `${selectors.booleanPolicySection.policyFieldCard} ${selectors.booleanPolicySection.andOrOperator}`;
                cy.get(policyFieldCardAndOrOperator).should('contain', 'OR');
                cy.get(policyFieldCardAndOrOperator).click();
                cy.get(policyFieldCardAndOrOperator).should('contain', 'AND');
                cy.get(policyFieldCardAndOrOperator).click();
                cy.get(policyFieldCardAndOrOperator).should('contain', 'OR');
            });

            it('should be disabled if the Policy Field cannot be ANDed', () => {
                // unfurl Image Contents policy key group
                clickPolicyKeyGroup('Image Contents');
                dragFieldIntoSection(
                    `${selectors.booleanPolicySection.policyKey}:contains("Image Age")`
                );
                cy.get(selectors.booleanPolicySection.addPolicyFieldValueBtn).click();
                const policyFieldCardAndOrOperator = `${selectors.booleanPolicySection.policyFieldCard} ${selectors.booleanPolicySection.andOrOperator}`;
                cy.get(policyFieldCardAndOrOperator).should('contain', 'OR');
                cy.get(policyFieldCardAndOrOperator).click();
                cy.get(policyFieldCardAndOrOperator).should('contain', 'OR');
            });
        });

        describe('Policy Field Card NOT toggle', () => {
            beforeEach(() => {
                addPolicy();
                goToNextWizardStage();
                addPolicySection();
            });
            it('should negate the Policy Field Card when the toggle is clicked & should show negated text', () => {
                addPolicyFieldCard(0);
                cy.get(selectors.booleanPolicySection.policyFieldCard).should(
                    'contain',
                    'Image pulled from registry'
                );
                cy.get(selectors.booleanPolicySection.notToggle).click();
                cy.get(selectors.booleanPolicySection.policyFieldCard).should(
                    'contain',
                    'Image not pulled from registry'
                );
            });

            it('should not exist if the Policy Field cannot be negated', () => {
                // unfurl Image Contents policy key group
                clickPolicyKeyGroup('Image Contents');
                dragFieldIntoSection(
                    `${selectors.booleanPolicySection.policyKey}:contains("Image Age")`
                );
                cy.get(selectors.booleanPolicySection.policyFieldCard).should(
                    'contain',
                    'Minimum days since image was built'
                );
                cy.get(selectors.booleanPolicySection.notToggle).should('not.exist');
            });
        });

        describe('Policy Field Keys', () => {
            beforeEach(() => {
                addPolicy();
                goToNextWizardStage();
            });

            it('should be grouped into categories', () => {
                cy.get(selectors.booleanPolicySection.policyKeyGroupBtn).should((values) => {
                    expect(values).to.have.length(NUM_POLICY_CATEGORIES);
                });
            });
            it('should collapse categories when clicking the carrot', () => {
                cy.get(`${selectors.booleanPolicySection.policyKey}:first`)
                    .scrollIntoView()
                    .should('be.visible');
                cy.get(`${selectors.booleanPolicySection.policyKeyGroupBtn}:first`).click();
                cy.get(`${selectors.booleanPolicySection.policyKeyGroupContent}:first`).should(
                    'have.class',
                    'overflow-hidden'
                );
            });
            it('should have categories collapsed by default if not first group', () => {
                cy.get(`${selectors.booleanPolicySection.policyKeyGroupContent}:first`)
                    .scrollIntoView()
                    .should('be.visible');
                cy.get(`${selectors.booleanPolicySection.policyKeyGroupContent}:last`)
                    .scrollIntoView()
                    .should('have.class', 'overflow-hidden');
            });
        });

        describe('Multiple Policy Sections', () => {
            beforeEach(() => {
                addPolicy();
                goToNextWizardStage();
                addPolicySection();
            });
            it('should add a Policy Section with a pre-populated Policy Section header', () => {
                cy.get(selectors.booleanPolicySection.policySection).then(() => {
                    cy.get(selectors.booleanPolicySection.sectionHeader.text)
                        .invoke('text')
                        .then((headerText) => {
                            expect(headerText).to.equal('Policy Section 1');
                        });
                });
            });

            it('should delete a Policy Section', () => {
                cy.get(selectors.booleanPolicySection.removePolicySectionBtn).click();
                cy.get(selectors.booleanPolicySection.policySection).should('not.exist');
            });

            it('should edit the Policy Section header name', () => {
                cy.get(selectors.booleanPolicySection.sectionHeader.editBtn).click();
                const newHeaderText = 'new policy section';
                cy.get(selectors.booleanPolicySection.sectionHeader.input).type(
                    `{selectall}${newHeaderText}`
                );
                cy.get(selectors.booleanPolicySection.sectionHeader.confirmBtn).click();
                cy.get(selectors.booleanPolicySection.sectionHeader.text)
                    .invoke('text')
                    .then((headerText) => {
                        expect(headerText).to.equal(newHeaderText);
                    });
            });
        });

        describe('Data consistency', () => {
            it('should read in data properly when provided', () => {
                cy.get(selectors.policies.scanImage).click();
                cy.get(selectors.booleanPolicySection.policySection)
                    .scrollIntoView()
                    .should('exist');
                cy.get(selectors.booleanPolicySection.sectionHeader.text).should('exist');
                cy.get(selectors.booleanPolicySection.policyFieldCard).should(
                    'contain',
                    'Minimum days since image was built'
                );
                cy.get(`${selectors.booleanPolicySection.policyFieldValue} input`).should(
                    'be.disabled'
                );
            });

            it('should keep same form values from edit details stage to edit criteria stage and back', () => {
                cy.get(selectors.tableFirstRow).click({ force: true });
                editPolicy();
                cy.get(selectors.form.nameInput).type('1234');
                goToNextWizardStage();
                goToPrevWizardStage();
                cy.get(selectors.form.nameInput).should('contain.value', '1234');
            });
        });
    });
});

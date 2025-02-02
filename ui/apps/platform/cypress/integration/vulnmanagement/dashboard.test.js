import withAuth from '../../helpers/basicAuth';
import { getRegExpForTitleWithBranding } from '../../helpers/title';
import {
    interactAndWaitForVulnerabilityManagementEntities,
    verifyVulnerabilityManagementDashboardCVEs,
    visitVulnerabilityManagementDashboard,
    visitVulnerabilityManagementDashboardFromLeftNav,
} from './VulnerabilityManagement.helpers';
import { selectors } from './VulnerabilityManagement.selectors';

function verifyVulnerabilityManagementDashboardApplicationAndInfrastructure(
    entitiesKey,
    menuListItemText
) {
    const menuButtonSelector = `button[data-testid="menu-button"]:contains("Application & Infrastructure")`;
    const menuListItemSelector = `${menuButtonSelector} + div a:contains("${menuListItemText}")`;

    cy.get(menuButtonSelector).click(); // open menu list
    interactAndWaitForVulnerabilityManagementEntities(() => {
        cy.get(menuListItemSelector).click(); // visit entities list
    }, entitiesKey);
}

function getViewAllSelectorForWidget(widgetHeading) {
    return `${selectors.getWidget(widgetHeading)} a:contains("View All")`;
}

function selectTopRiskyOption(optionText) {
    cy.get('[data-testid="widget"]:contains("Top risky") .react-select__control').click();
    cy.get(
        `[data-testid="widget"]:contains("Top risky") .react-select__option:contains("${optionText}")`
    ).click();
}

describe('Vulnerability Management Dashboard', () => {
    withAuth();

    it('should visit using the left nav', () => {
        visitVulnerabilityManagementDashboardFromLeftNav();
    });

    it('should have title', () => {
        visitVulnerabilityManagementDashboard();

        cy.title().should(
            'match',
            getRegExpForTitleWithBranding('Vulnerability Management - Dashboard')
        );
    });

    it('should navigate from menu item for Image CVEs to entities list', () => {
        verifyVulnerabilityManagementDashboardCVEs('image-cves', /^\d+ Image CVEs?$/);
    });

    it('should navigate from menu item for Node CVEs to entities list', () => {
        verifyVulnerabilityManagementDashboardCVEs('node-cves', /^\d+ Node CVEs?$/);
    });

    it('should navigate from menu item Cluster (Platform) CVEs to entities list', () => {
        verifyVulnerabilityManagementDashboardCVEs('cluster-cves', /^\d+ Platform CVEs?$/);
    });

    it('should navigate from images link to images list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'images';
        interactAndWaitForVulnerabilityManagementEntities(() => {
            cy.get('[data-testid="page-header"] a')
                .contains('[data-testid="tile-link-value"]', /^\d+ images?/)
                .click();
        }, entitiesKey);

        cy.get('[data-testid="panel"]').contains('[data-testid="panel-header"]', /^\d+ images?/);
    });

    it('should properly navigate to the clusters list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'clusters';
        const menuListItemText = 'clusters'; // lowercase because of Tailwind capitalize class

        verifyVulnerabilityManagementDashboardApplicationAndInfrastructure(
            entitiesKey,
            menuListItemText
        );
    });

    it('should properly navigate to the namespaces list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'namespaces';
        const menuListItemText = 'namespaces'; // lowercase because of Tailwind capitalize class

        verifyVulnerabilityManagementDashboardApplicationAndInfrastructure(
            entitiesKey,
            menuListItemText
        );
    });

    it('should properly navigate to the deployments list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'deployments';
        const menuListItemText = 'deployments'; // lowercase because of Tailwind capitalize class

        verifyVulnerabilityManagementDashboardApplicationAndInfrastructure(
            entitiesKey,
            menuListItemText
        );
    });

    it('should navigate to the node components list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'node-components';
        const menuListItemText = 'node components'; // lowercase because of Tailwind capitalize class

        verifyVulnerabilityManagementDashboardApplicationAndInfrastructure(
            entitiesKey,
            menuListItemText
        );
    });

    it('should navigate to the image components list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'image-components';
        const menuListItemText = 'image components'; // lowercase because of Tailwind capitalize class

        verifyVulnerabilityManagementDashboardApplicationAndInfrastructure(
            entitiesKey,
            menuListItemText
        );
    });

    it('clicking the "Top Riskiest Images" widget\'s "View All" button should take you to the images list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'images';
        const widgetHeading = 'Top Riskiest Images';

        interactAndWaitForVulnerabilityManagementEntities(() => {
            cy.get(getViewAllSelectorForWidget(widgetHeading)).click();
        }, entitiesKey);

        cy.location('search').should(
            'eq',
            '?sort[0][id]=Image%20Risk%20Priority&sort[0][desc]=false'
        );
    });

    it('clicking the "Recently Detected Image Vulnerabilities" widget\'s "View All" button should take you to the CVEs list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'image-cves';
        const widgetHeading = 'Recently Detected Image Vulnerabilities';

        interactAndWaitForVulnerabilityManagementEntities(() => {
            cy.get(getViewAllSelectorForWidget(widgetHeading)).click();
        }, entitiesKey);

        cy.location('search').should('eq', '?sort[0][id]=CVE%20Created%20Time&sort[0][desc]=true');
    });

    it('clicking the "Most Common Image Vulnerabilities" widget\'s "View All" button should take you to the CVEs list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'image-cves';
        const widgetHeading = 'Most Common Image Vulnerabilities';

        interactAndWaitForVulnerabilityManagementEntities(() => {
            cy.get(getViewAllSelectorForWidget(widgetHeading)).click();
        }, entitiesKey);

        cy.location('search').should(
            'eq',
            '?sort[0][id]=Deployment%20Count&sort[0][desc]=true&sort[1][id]=CVSS&sort[1][desc]=true'
        );
    });

    it('clicking the "Clusters With Most Orchestrator & Istio Vulnerabilities" widget\'s "View All" button should take you to the clusters list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'clusters';
        const widgetHeading = 'Clusters With Most Orchestrator & Istio Vulnerabilities';

        interactAndWaitForVulnerabilityManagementEntities(() => {
            cy.get(getViewAllSelectorForWidget(widgetHeading)).click();
        }, entitiesKey);

        cy.location('search').should('eq', '');
    });

    it('clicking the "Top risky deployments by CVE count & CVSS score" widget\'s "View All" button should take you to the deployments list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'deployments';
        const widgetHeading = 'Top risky deployments by CVE count & CVSS score';

        interactAndWaitForVulnerabilityManagementEntities(() => {
            cy.get(getViewAllSelectorForWidget(widgetHeading)).click();
        }, entitiesKey);
    });

    it('clicking the "Top risky namespaces by CVE count & CVSS score" widget\'s "View All" button should take you to the namespaces list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'namespaces';
        const widgetHeading = 'Top risky namespaces by CVE count & CVSS score';

        selectTopRiskyOption(widgetHeading);
        interactAndWaitForVulnerabilityManagementEntities(() => {
            cy.get(getViewAllSelectorForWidget(widgetHeading)).click();
        }, entitiesKey);
    });

    it('clicking the "Top risky images by CVE count & CVSS score" widget\'s "View All" button should take you to the images list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'images';
        const widgetHeading = 'Top risky images by CVE count & CVSS score';

        selectTopRiskyOption(widgetHeading);
        interactAndWaitForVulnerabilityManagementEntities(() => {
            cy.get(getViewAllSelectorForWidget(widgetHeading)).click();
        }, entitiesKey);
    });

    it('clicking the "Top risky images by CVE count & CVSS score" widget\'s "View All" button should take you to the nodes list', () => {
        visitVulnerabilityManagementDashboard();

        const entitiesKey = 'nodes';
        const widgetHeading = 'Top risky nodes by CVE count & CVSS score';

        selectTopRiskyOption(widgetHeading);
        interactAndWaitForVulnerabilityManagementEntities(() => {
            cy.get(getViewAllSelectorForWidget(widgetHeading)).click();
        }, entitiesKey);
    });
});

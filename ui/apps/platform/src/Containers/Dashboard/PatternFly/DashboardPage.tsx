import React from 'react';
import { Divider, Flex, FlexItem, Gallery, PageSection, Text, Title } from '@patternfly/react-core';
import SummaryCounts from './SummaryCounts';
import ScopeBar from './ScopeBar';

import ImagesAtMostRisk from './Widgets/ImagesAtMostRisk';
import ViolationsByPolicyCategory from './Widgets/ViolationsByPolicyCategory';
import DeploymentsAtMostRisk from './Widgets/DeploymentsAtMostRisk';
import AgingImages from './Widgets/AgingImages';
import ViolationsByPolicySeverity from './Widgets/ViolationsByPolicySeverity';
import ComplianceLevelsByStandard from './Widgets/ComplianceLevelsByStandard';

// This value is an estimate of the minimum size the widgets need to be to
// ensure the heading and options do not wrap and break layout.
const minWidgetWidth = 510;

function DashboardPage() {
    return (
        <>
            <PageSection variant="light" padding={{ default: 'noPadding' }}>
                <SummaryCounts />
            </PageSection>
            <Divider component="div" />
            <PageSection variant="light">
                <Flex
                    direction={{ default: 'column', lg: 'row' }}
                    alignItems={{ default: 'alignItemsFlexStart', lg: 'alignItemsCenter' }}
                >
                    <FlexItem>
                        <Title headingLevel="h1">Dashboard</Title>
                        <Text>Review security metrics across all or select resources</Text>
                    </FlexItem>
                    <FlexItem
                        grow={{ default: 'grow' }}
                        className="pf-u-display-flex pf-u-justify-content-flex-end"
                    >
                        <ScopeBar />
                    </FlexItem>
                </Flex>
            </PageSection>
            <Divider component="div" />
            <PageSection>
                <Gallery
                    style={{
                        // Ensure the grid has never grows large enough to show 4 columns
                        maxWidth: `calc(calc(${minWidgetWidth}px * 4) + calc(var(--pf-l-gallery--m-gutter--GridGap) * 3) - 1px)`,
                    }}
                    hasGutter
                    minWidths={{ default: `${minWidgetWidth}px` }}
                >
                    <ViolationsByPolicySeverity />
                    <ImagesAtMostRisk />
                    <DeploymentsAtMostRisk />
                    <AgingImages />
                    <ViolationsByPolicyCategory />
                    <ComplianceLevelsByStandard />
                </Gallery>
            </PageSection>
        </>
    );
}

export default DashboardPage;

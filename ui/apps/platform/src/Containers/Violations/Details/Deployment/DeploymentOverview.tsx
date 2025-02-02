import React, { ReactElement } from 'react';
import dateFns from 'date-fns';
import { DescriptionList } from '@patternfly/react-core';

import dateTimeFormat from 'constants/dateTimeFormat';
import DescriptionListItem from 'Components/DescriptionListItem';
import ObjectDescriptionList from 'Components/ObjectDescriptionList';
import { Deployment } from 'types/deployment.proto';

export type DeploymentOverviewProps = {
    deployment: Deployment;
};

function DeploymentOverview({ deployment }: DeploymentOverviewProps): ReactElement {
    const imagePullSecrets = deployment?.imagePullSecrets || [];
    return (
        <DescriptionList isHorizontal>
            <DescriptionListItem term="Deployment ID" desc={deployment.id} />
            <DescriptionListItem term="Deployment name" desc={deployment.name} />
            <DescriptionListItem term="Deployment type" desc={deployment.type} />
            <DescriptionListItem term="Cluster" desc={deployment.clusterName} />
            <DescriptionListItem term="Namespace" desc={deployment.namespace} />
            <DescriptionListItem term="Replicas" desc={deployment.replicas} />
            <DescriptionListItem
                term="Created"
                desc={
                    deployment.created
                        ? dateFns.format(deployment.created, dateTimeFormat)
                        : 'not available'
                }
            />
            <DescriptionListItem
                term="Labels"
                desc={<ObjectDescriptionList data={deployment.labels} />}
            />
            <DescriptionListItem
                term="Annotations"
                desc={<ObjectDescriptionList data={deployment.annotations} />}
            />
            <DescriptionListItem term="Service account" desc={deployment.serviceAccount} />
            {imagePullSecrets.length > 0 && (
                <DescriptionListItem term="Image pull secrets" desc={imagePullSecrets.join(', ')} />
            )}
        </DescriptionList>
    );
}

export default DeploymentOverview;

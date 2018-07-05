import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';

import { clusterFormId, clusterTypes } from 'reducers/clusters';
import FormField from 'Components/FormField';
import ReduxTextField from 'Components/forms/ReduxTextField';
import ReduxCheckboxField from 'Components/forms/ReduxCheckboxField';

const CommonFields = () => (
    <React.Fragment>
        <FormField label="Name" required>
            <ReduxTextField name="name" placeholder="Cluster name" />
        </FormField>
    </React.Fragment>
);

const K8sFields = ({ metadata }) => (
    <React.Fragment>
        <CommonFields />
        <FormField label="Prevent Image" required>
            <ReduxTextField
                name="preventImage"
                placeholder={`stackrox.io/prevent:${metadata.version}`}
            />
        </FormField>
        <FormField label="Central API Endpoint" required>
            <ReduxTextField name="centralApiEndpoint" placeholder="central.stackrox:443" />
        </FormField>
        <FormField label="Namespace" required>
            <ReduxTextField name="kubernetes.params.namespace" placeholder="stackrox" />
        </FormField>
        <FormField label="Image Pull Secret Name" required>
            <ReduxTextField name="kubernetes.params.imagePullSecret" placeholder="stackrox" />
        </FormField>
    </React.Fragment>
);

K8sFields.propTypes = {
    metadata: PropTypes.shape({ version: PropTypes.string }).isRequired
};

const OpenShiftFields = ({ metadata }) => (
    <React.Fragment>
        <CommonFields />
        <FormField label="Prevent Image" required>
            <ReduxTextField
                name="preventImage"
                placeholder={`docker-registry.default.svc.local:5000/stackrox/prevent:${
                    metadata.version
                }`}
            />
        </FormField>
        <FormField label="Central API Endpoint" required>
            <ReduxTextField name="centralApiEndpoint" placeholder="central.stackrox:443" />
        </FormField>
        <FormField label="Namespace" required>
            <ReduxTextField name="openshift.params.namespace" placeholder="stackrox" />
        </FormField>
    </React.Fragment>
);

OpenShiftFields.propTypes = {
    metadata: PropTypes.shape({ version: PropTypes.string }).isRequired
};

const DockerFields = ({ metadata }) => (
    <React.Fragment>
        <CommonFields />
        <FormField label="Prevent Image" required>
            <ReduxTextField
                name="preventImage"
                placeholder={`stackrox.io/prevent:${metadata.version}`}
            />
        </FormField>
        <FormField label="Central API Endpoint" required>
            <ReduxTextField name="centralApiEndpoint" placeholder="central.prevent_net:443" />
        </FormField>
        <FormField label="Disable Swarm TLS">
            <ReduxCheckboxField name="swarm.disableSwarmTls" />
        </FormField>
    </React.Fragment>
);

DockerFields.propTypes = {
    metadata: PropTypes.shape({ version: PropTypes.string }).isRequired
};

const clusterFields = {
    SWARM_CLUSTER: DockerFields,
    OPENSHIFT_CLUSTER: OpenShiftFields,
    KUBERNETES_CLUSTER: K8sFields
};

const ClusterEditForm = ({ clusterType, metadata }) => {
    const ClusterFields = clusterFields[clusterType];
    if (!ClusterFields) throw new Error(`Unknown cluster type "${clusterType}"`);
    return (
        <form className="p-4 w-full mb-8" data-test-id="cluster-form">
            <ClusterFields metadata={metadata} />
        </form>
    );
};
ClusterEditForm.propTypes = {
    clusterType: PropTypes.oneOf(clusterTypes).isRequired,
    metadata: PropTypes.shape({ version: PropTypes.string }).isRequired
};

const ConnectedForm = reduxForm({ form: clusterFormId })(ClusterEditForm);

const initialValuesFactories = {
    SWARM_CLUSTER: metadata => ({
        preventImage: `stackrox.io/prevent:${metadata.version}`,
        centralApiEndpoint: 'central.prevent_net:443'
    }),
    OPENSHIFT_CLUSTER: metadata => ({
        preventImage: `docker-registry.default.svc.local:5000/stackrox/prevent:${metadata.version}`,
        centralApiEndpoint: 'central.stackrox:443',
        openshift: {
            params: {
                namespace: 'stackrox'
            }
        }
    }),
    KUBERNETES_CLUSTER: metadata => ({
        preventImage: `stackrox.io/prevent:${metadata.version}`,
        centralApiEndpoint: 'central.stackrox:443',
        openshift: {
            params: {
                namespace: 'stackrox',
                imagePullSecret: 'stackrox'
            }
        }
    })
};

const FormWrapper = ({ metadata, clusterType, initialValues }) => {
    const combinedInitialValues = {
        ...initialValuesFactories[clusterType](metadata),
        type: clusterType,
        ...initialValues // passed initial values can override anything
    };

    return (
        <ConnectedForm
            clusterType={clusterType}
            metadata={metadata}
            initialValues={combinedInitialValues}
        />
    );
};
FormWrapper.propTypes = {
    clusterType: PropTypes.oneOf(clusterTypes).isRequired,
    metadata: PropTypes.shape({ version: PropTypes.string }).isRequired,
    initialValues: PropTypes.shape({})
};
FormWrapper.defaultProps = {
    initialValues: {}
};

export default FormWrapper;

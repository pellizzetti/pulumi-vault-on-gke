import * as pulumi from '@pulumi/pulumi';

export * from './config/serviceAccount';
export * from './config/project';
export * from './config/bucket';
export * from './config/kms';
export * from './config/network';
export * from './config/k8s';
export * from './config/vault';

//const config = new pulumi.Config();
const configGCP = new pulumi.Config('gcp');

/**
 * The basis for creating, enabling, and using all Google Cloud services.
 * @default ''
 */
export const project = configGCP.get('project') || '';

/**
 * Specific geographical location where resources are hosted.
 * @default 'us-east1'
 */
export const region = configGCP.get('region') || 'us-east1';
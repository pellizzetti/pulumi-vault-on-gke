/* eslint-disable import/prefer-default-export */
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

/**
 * Number of nodes to deploy in each zone of the Kubernetes cluster.
 * For example, if there are 4 zones in the region and numNodesPerZone is 2,
 * 8 total nodes will be created.
 * @default 1
 */
export const kubernetesNodesPerZone =
  config.getNumber('kubernetesNodesPerZone') || 1;

/**
 * Instance type to use for the nodes.
 * @default 'n1-standard-2'
 */
export const kubernetesInstanceType =
  config.get('kubernetesInstanceType') || 'n1-standard-2';

/**
 * Maintenance window for GKE.
 * @default '06:00'
 */
export const kubernetesDailyMaintenanceWindow =
  config.get('kubernetesDailyMaintenanceWindow') || '06:00';

/**
 * Name of the logging service to use. By default this uses
 * the new Stackdriver GKE beta.
 * @default 'logging.googleapis.com/kubernetes'
 */
export const kubernetesLoggingService =
  config.get('kubernetesLoggingService') || 'logging.googleapis.com/kubernetes';

/**
 * Name of the monitoring service to use. By default this uses
 * the new Stackdriver GKE beta.
 * @default 'monitoring.googleapis.com/kubernetes'
 */
export const kubernetesMonitoringService =
  config.get('kubernetesMonitoringService') ||
  'monitoring.googleapis.com/kubernetes';

/**
 * Name of the KMS key to use for encrypting the Kubernetes database.
 * @default 'kubernetes-secrets'
 */
export const kubernetesSecretsCryptoKey =
  config.get('kubernetesSecretsCryptoKey') || 'kubernetes-secrets';

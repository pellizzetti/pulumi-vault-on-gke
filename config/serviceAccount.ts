import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

/**
 * List of IAM roles to assign to the service account.
 * @default
 * [
 *   'roles/logging.logWriter',
 *   'roles/monitoring.metricWriter',
 *   'roles/monitoring.viewer',
 * ]
 */
export const serviceAccountIamRoles = config.getObject<string[]>(
  'serviceAccountIamRoles'
) || [
  'roles/logging.logWriter',
  'roles/monitoring.metricWriter',
  'roles/monitoring.viewer',
];

/**
 * List of arbitrary additional IAM roles to attach to the service account
 * on the Vault nodes.
 * @default []
 */
export const serviceAccountCustomIamRoles =
  config.getObject<string[]>('serviceAccountCustomIamRoles') || [];

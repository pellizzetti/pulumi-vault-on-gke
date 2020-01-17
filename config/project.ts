/* eslint-disable import/prefer-default-export */
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

/**
 * List of services to enable on the project.
 * @default
 * [
 *   'cloudkms.googleapis.com',
 *   'cloudresourcemanager.googleapis.com',
 *   'container.googleapis.com',
 *   'compute.googleapis.com',
 *   'iam.googleapis.com',
 *   'logging.googleapis.com',
 *   'monitoring.googleapis.com',
 * ]
 */
export const projectServices = config.getObject<string[]>(
  'projectServices'
) || [
  'cloudkms.googleapis.com',
  'cloudresourcemanager.googleapis.com',
  'container.googleapis.com',
  'compute.googleapis.com',
  'iam.googleapis.com',
  'logging.googleapis.com',
  'monitoring.googleapis.com',
];

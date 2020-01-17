/* eslint-disable import/prefer-default-export */
import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

/**
 * The [GCS location](https://cloud.google.com/storage/docs/bucket-locations).
 * @default 'US'
 */
export const storageBucketRegion = config.get('storageBucketRoles') || 'US';

/**
 * List of storage bucket roles.
 * @default
 * [
 *   'roles/storage.legacyBucketReader',
 *   'roles/storage.objectAdmin',
 * ]
 */
export const storageBucketRoles = config.getObject<string[]>(
  'storageBucketRoles'
) || ['roles/storage.legacyBucketReader', 'roles/storage.objectAdmin'];

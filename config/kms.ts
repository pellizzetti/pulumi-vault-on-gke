import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

/**
 * String value to prefix the generated key ring with.
 * @default 'vault-'
 */
export const kmsKeyRingPrefix = config.get('kmsKeyRingPrefix') || 'vault-';

/**
 * String value to use for the name of the KMS crypto key.
 * @default 'vault-init'
 */
export const kmsCryptoKey = config.get('kmsCryptoKey') || 'vault-init';

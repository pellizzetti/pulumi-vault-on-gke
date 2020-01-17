import * as gcp from '@pulumi/gcp';

interface VaultBucketArgs {
  location: string;
  storageBucketRoles: string[];
  serviceAccount: gcp.serviceAccount.Account;
  projectServices: gcp.projects.Service[];
}

/**
 * Create vault storage bucket and grant service account access to the storage
 * bucket.
 */
export default function createBucket(
  args: VaultBucketArgs
): {
  bucket: gcp.storage.Bucket;
  appliedBucketIamRoles: gcp.storage.BucketIAMMember[];
} {
  const bucket = new gcp.storage.Bucket(
    'vault',
    {
      location: args.location,
      name: `${gcp.config.project}-vault-storage`,
      forceDestroy: true,
      storageClass: 'MULTI_REGIONAL',
      versioning: {
        enabled: true,
      },
      lifecycleRules: [
        { action: { type: 'Delete' }, condition: { numNewerVersions: 1 } },
      ],
    },
    { dependsOn: args.projectServices, additionalSecretOutputs: ['name'] }
  );

  const appliedBucketIamRoles = args.storageBucketRoles.reduce((acc, cur) => {
    acc.push(
      new gcp.storage.BucketIAMMember(`vault-${cur.replace(/[/.]/g, '-')}`, {
        bucket: bucket.name,
        member: args.serviceAccount.email.apply(
          email => `serviceAccount:${email}`
        ),
        role: cur,
      })
    );
    return acc;
  }, [] as gcp.storage.BucketIAMMember[]);

  return { bucket, appliedBucketIamRoles };
}

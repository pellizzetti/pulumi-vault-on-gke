[![Deploy](https://get.pulumi.com/new/button.svg)](https://app.pulumi.com/new?template=https://github.com/pellizzetti/pulumi-vault-on-gke/tree/master/)

# HashiCorp Vault on Google Kubernetes Engine (GKE) with Pulumi

This example use infrastructure-as-code to provisions a highly-available [HashiCorp Vault][vault] cluster on [Google Kubernetes Engine (GKE)][gke] using [Pulumi][pulumi] as the provisioning tool.

This example is basically the same as [Seth Vargo's HashiCorp Vault on GKE with Terraform][vault-on-gke], but using [Pulumi][pulumi] instead of Terraform (duh!).

## Prerequisites

Ensure you have [downloaded and installed the Pulumi CLI][pulumi].

We will be deploying to Google Cloud Platform (GCP), so you will need an account. If you don't have an account, [sign up for free here][gcp-trial]. In either case, [follow the instructions here][pulumi-gcp] to connect Pulumi to your GCP account.

This example assumes that you have GCP's `gcloud` CLI on your path. This is installed as part of the [GCP SDK][gcp-sdk].

## Feature Highlights

- **Vault HA** - The Vault cluster is deployed in HA mode backed by [Google Cloud Storage][gcs]

- **Production Hardened** - Vault is deployed according to the [production hardening guide][production-hardening-guide]. Please see the [security section](#security) for more information.

- **Auto-Init and Unseal** - Vault is automatically initialized and unsealed at runtime. The unseal keys are encrypted with [Google Cloud KMS][kms] and stored in [Google Cloud Storage][gcs]

- **Full Isolation** - The Vault cluster is provisioned in it's own Kubernetes cluster in a dedicated GCP project that is provisioned dynamically at runtime. Clients connect to Vault using **only** the load balancer and Vault is treated as a managed external service.

- **Audit Logging** - Audit logging to Stackdriver can be optionally enabled with minimal additional configuration.


## Running the Example

After cloning this repo, run these commands. After some minutes, you'll have a fully functioning Vault cluster at GKE!

1. Create a new stack, which is an isolated deployment target for this example:

    ```text
    $ pulumi stack init gke-vault-dev
    ```

2. Set the required configuration variables for this program:

    ```text
    $ pulumi config set gcp:project <PROJECT_ID>
    $ pulumi config set gcp:region us-east1
    ```

    By default, your cluster will have 1 node per zone of type `n1-standard-2`. This is configurable, however; for instance if we'd like to choose 3 nodes per zone of type `n1-highcpu-4` instead, we can run these commands:

    ```text
    $ pulumi config set kubernetesNodesPerZone 3
    $ pulumi config set kubernetesInstanceType n1-highcpu-4
    ```

    Values in a list can be set from the command line using the `--path` flag:

    ```text
    $ pulumi config set --path storageBucketRoles[0] roles/storage.legacyBucketReader
    $ pulumi config set --path storageBucketRoles[1] roles/storage.objectAdmin
    $ pulumi config set --path storageBucketRoles[2] roles/...
    ```

    Setting values in nested structures can be set like:

    ```text
    $ pulumi config set --path kubernetesMastersIpv4Cidr[0].displayName Ganymede
    $ pulumi config set --path kubernetesMastersIpv4Cidr[0].cidrBlock 35.46.158.145/32
    ```

    This example contains a ton of useful configs, to get a better undestanding you'll find a [reference document](./config/README.md) in the `config` folder. You can also change the project configuration after provisioning.

4. Install dependencies:

    ```text
    $ yarn
    ```

4. Deploy everything with the `pulumi up` command. This provisions all the GCP resources necessary all in a single gesture:

    ```text
    $ pulumi up
    ```

   This will show you a preview, ask for confirmation, and then chug away at provisioning everything.

5. Once you are done, you can destroy all of the resources, and the stack:

    ```text
    $ pulumi destroy
    $ pulumi stack rm
    ```

## Interact with Vault

1. Export environment variables:

    Vault reads these environment variables for communication. Set Vault's address, the CA to use for validation, and the initial root token.

    ```text
    $ eval $(pulumi stack output vaultEnv --show-secrets)
    ```

1. Run some commands:

    ```text
    $ vault secrets enable -path=secret -version=2 kv
    $ vault kv put secret/foo a=b
    ```

## Audit Logging

Audit logging is not enabled in a default Vault installation. To enable audit logging to [Stackdriver][stackdriver] on Google Cloud, enable the `file` audit device on `stdout`:

```text
$ vault audit enable file file_path=stdout
```

That's it! Vault will now log all audit requests to Stackdriver. Additionally, because the configuration uses an L4 load balancer, Vault does not need to parse `X-Forwarded-For` headers to extract the client IP, as requests are passed directly to the node.

## Additional Permissions

You may wish to grant the Vault service account additional permissions. This service account is attached to the GKE nodes and will be the "default application credentials" for Vault.

To specify additional permissions, run the following:

```text
$ pulumi config set --path serviceAccountCustomIamRoles[0] roles/...
```

### GCP Auth Method

To use the [GCP auth method][vault-gcp-auth] with the default application credentials, the Vault server needs the following role:

```text
roles/iam.serviceAccountKeyAdmin
```

Alternatively you can create and upload a dedicated service account for the GCP auth method during configuration and restrict the node-level default application credentials.

### GCP Secrets Engine

To use the [GCP secrets engine][vault-gcp-secrets] with the default application credentials, the Vault server needs the following roles:

```text
roles/iam.serviceAccountKeyAdmin
roles/iam.serviceAccountAdmin
```

Additionally, Vault needs the superset of any permissions it will grant. For example, if you want Vault to generate GCP access tokens with access to compute, you must also grant Vault access to compute.

Alternatively you can create and upload a dedicated service account for the GCP auth method during configuration and restrict the node-level default application credentials.

## Security

### Root Token

This set of Pulumi configurations is designed to make your life easy. It's a best-practices setup for Vault, but also aids in the retrieval of the initial root token.

As such, you should **use a Pulumi state backend with encryption enabled, such as Cloud Storage**.

To access the root token:

```text
$ eval $(pulumi stack output decryptRootToken --show-secrets)
```

### Private Cluster

The Kubernetes cluster is a "private" cluster, meaning nodes do not have publicly exposed IP addresses, and pods are only publicly accessible if exposed through a load balancer service. Additionally, only authorized IP CIDR blocks are able to communicate with the Kubernetes master nodes.

The default allowed CIDR is `0.0.0.0/0 (anyone)`. **You should restrict this CIDR to the IP address(es) which will access the nodes!**.

[vault]: https://www.vaultproject.io
[gke]: https://cloud.google.com/kubernetes-engine
[vault-on-gke]: https://github.com/sethvargo/vault-on-gke
[pulumi]: https://www.pulumi.com
[pulumi-cli]: https://www.pulumi.com/docs/get-started/install
[gcp-trial]: https://cloud.google.com/free
[pulumi-gcp]: https://www.pulumi.com/docs/get-started/install
[gcp-sdk]: https://cloud.google.com/sdk
[production-hardening-guide]: https://www.vaultproject.io/guides/operations/production.html
[gcs]: https://cloud.google.com/storage
[kms]: https://cloud.google.com/kms
[stackdriver]: https://cloud.google.com/stackdriver/

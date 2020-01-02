![https://get.pulumi.com/new/button.svg](https://get.pulumi.com/new/button.svg)

# HashiCorp Vault on Google Kubernetes Engine (GKE) with Pulumi

This example use infrastructure-as-code to provisions a highly-available [HashiCorp Vault][vault] cluster on [Google Kubernetes Engine (GKE)][gke] using [Pulumi][pulumi] as the provisioning tool.

## Prerequisites

Ensure you have [downloaded and installed the Pulumi CLI][pulumi].

We will be deploying to Google Cloud Platform (GCP), so you will need an account. If you don't have an account, [sign up for free here][gcp-trial]. In either case, [follow the instructions here][pulumi-gcp] to connect Pulumi to your GCP account.

This example assumes that you have GCP's `gcloud` CLI on your path. This is installed as part of the [GCP SDK][gcp-sdk].

[vault]: https://www.vaultproject.io
[gke]: https://cloud.google.com/kubernetes-engine
[pulumi]: https://www.pulumi.com
[pulumi-cli]: https://www.pulumi.com/docs/get-started/install
[gcp-trial]: https://cloud.google.com/free
[pulumi-gcp]: https://www.pulumi.com/docs/get-started/install
[gcp-sdk]: https://cloud.google.com/sdk

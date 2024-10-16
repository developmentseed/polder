# polder
Web AOI viewer

## Installation

This application needs a kubernetes cluster. Once you have one set up you can `helm install` with the following steps:

0. `eoapi-k8s` depends on the [Crunchydata Postgresql Operator](https://access.crunchydata.com/documentation/postgres-operator/latest/installation/helm). Install that first:

   ```bash
   helm install --set disable_check_for_upgrades=true pgo oci://registry.developers.crunchydata.com/crunchydata/pgo --version 5.5.2
   ```

1. Add the eoapi repo from https://devseed.com/eoapi-k8s/:

  ```bash
  helm repo add eoapi https://devseed.com/eoapi-k8s/
  ```

2. Include dependencies

    ```bash
    helm dependency build
    ```

2. Then go to the `helm` directory and do `helm install`

   ```bash
   cd helm && helm install -n polder --create-namespace polder .
   ```

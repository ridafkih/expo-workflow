# Expo Workflow

This is a CI/CD workflow that's part of the Expo workflow by @ridafkih.

Using `dephash`, upon an application change, this workflow can detect whether or not the Expo application requires a rebuild, or an update, and act accordingly. It automatically handles incrementing version numbers, and more.

## Inputs

### ridafkih/expo-workflow

```yaml
inputs:
  github-token:
  github-username:
  organization-name:
  repository-name:
  branch-name: ${{ github.head_ref || github.ref_name }}
```

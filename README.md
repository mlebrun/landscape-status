# landscape-status
Slack Chat integration to easily manage landscape environments.

### Usage

In Slack, you can use `slash commands` by just typing `/{command}`. When using Landscapes Status, the following actions are supported:

  - `/landscapes`                    - Lists all landscapes and who has locked them.
  - `/landscapes add {landscape}`    - Adds a new landscape to the list.
  - `/landscapes remove {landscape}` - Removes a landscape from the list.
  - `/landscapes lock {landscape}`   - Locks a landscape (doesn't actually do anything exception put your name next to the landscape in the list).
  - `/landscapes unlock {landscape}` - Unlocks a landscape.

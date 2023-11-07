# MattLabs
This is the repository containing the code for the [MattLabs](https://mattlabs.net) website.

This repository contains two branches: master and dev. The master branch represents the production website code hosted at https://mattlabs.net while the dev branch represents the dev branch code hosted at https://dev.mattlabs.net.

The purpose of this setup is to eliminate pushing breaking changes to the production website, especially if development will take place over a long duration which may render the site unusable. Additionally, having a git repository to track site changes and have the site code hosted on GitHub helps make collaboration easier, acts as a backup and makes future deployments easier.

The workflow for this project:
- Changes are made through an IDE and uploaded automatically via SFTP to the dev web server to be viewed in real time.
- Changes are committed to the dev branch.
- Once all commits are made, a pull request to the master branch is created and merged.
- Jenkins triggers a build which pulls the latest master code and uploads it to the production web server.

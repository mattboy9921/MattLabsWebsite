# MattLabs
This is the repository containing the code for the [MattLabs](https://mattlabs.net) website.

This repository contains two branches: master and dev and three sites: dev, stage, and production. 

**Dev:** https://dev.mattlabs.net - Shows real time updates to the code, can have errors or instibility.

**Stage:** https://stage.mattlabs.net - Based on commits to the dev branch of the repository, typically more stable, less errors.

**Production:** https://mattlabs.net - Based on the master branch, the production site, stable and error free.

The purpose of this setup is to eliminate pushing breaking changes to the production website, especially if development will take place over a long duration which may render the site unusable. Additionally, having a git repository to track site changes and have the site code hosted on GitHub helps make collaboration easier, acts as a backup and makes future deployments easier.

The workflow for this project:
- Changes are made through an IDE and uploaded automatically via SFTP to the dev web server to be viewed in real time via the dev site.
- Changes are committed to the dev branch.
- Jenkins triggers a build which pulls the latest dev code and uploads it to the stage server which can be viewed on the stage site.
- Once all commits are made, a pull request to the master branch is created and merged.
- Jenkins triggers a build which pulls the latest master code and uploads it to the production server which can be viewed on the production site.

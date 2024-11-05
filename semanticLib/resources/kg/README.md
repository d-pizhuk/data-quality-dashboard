# GraphDB Docker Image Creation and Export

This document outlines the steps to create a Docker image from a running GraphDB container and export it for later use.

## Prerequisites

- Ensure Docker is installed and running on your system.
- Have the necessary permissions to run Docker commands.

## Pulling the GraphDB Image

First, pull the GraphDB Docker image from the Docker registry:

`docker pull ontotext/graphdb:10.7.6`


## Running the GraphDB Container

Run the container in detached mode with the following command:

`docker run -d --name skg_container -p 7200:7200 ontotext/graphdb:10.7.6`

## Adding Data to the GraphDB Repository

After the container is running, add your data to the GraphDB repository as needed.

## Stopping the Container

Once you have added all your data, stop the container with the following command:

`docker stop skg_container`

## Creating a New Image from the Container

To create a new Docker image from the stopped container, use:

`docker commit skg_container skg_graphdb`


This command creates a new image named `skg_graphdb`.

## Saving the Docker Image

To save the created image to a tar file, run:

`docker save skg_graphdb > path\to\any\dir\skg_graphdb.tar`


#!/usr/bin/bash

TAG=$(jq -r '.version' package.json)

docker build -t jaakkytt/dst-server-status-bot:latest .

docker tag jaakkytt/dst-server-status-bot:latest jaakkytt/dst-server-status-bot:"$TAG"

docker push jaakkytt/dst-server-status-bot:latest
docker push jaakkytt/dst-server-status-bot:"$TAG"

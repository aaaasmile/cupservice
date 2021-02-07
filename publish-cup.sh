#!/bin/bash

echo "Builds app"
go build -o cupservice.bin

cd ./deploy

echo "build the zip package"
./deploy.bin -target cupservice -outdir ~/app/go/cupservice/zips/
cd ~/app/go/cupservice/

echo "update the service"
./update-service.sh

echo "Ready to fly"
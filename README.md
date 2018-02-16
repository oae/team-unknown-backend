# ParanBende
If you are in need of urgent cash in your pocket ParanBende to the rescue.

## Overview
ParanBende is an application that lets you convert your online money into cash without moving an inch. You can simply issue a cash withdrawal request within app and wait for someone near you that can bring you this cash in minutes.

### Features

#### Taker
* See available minimum and maximum amounts you can withdraw in your area in realtime
* Create withdrawal request
* Receive your cash after a maker approves your request and brings your cash
* Rate the maker

#### Maker
* Make yourself available/unavailable
* Set minimum/maximum cash amount
* Change the range of available area in kilometers
* Get notified when matching taker creates a withdrawal request
* Rate the taker


### Technical Details
* Realtime location sharing with websockets that is scaled via redis
* Geolocation queries using mongodb
* Push notification using onesignal or maybe parse-server
* Consistency between production and development environment using docker/docker-compose 

### Team
Team Unknown

### Members
* oae - Osman Alperen Elhan - Backend Developer
* yasinuslu - Ahmet Yasin Uslu - Backend Developer
* halitogunc - Halit Ogunc - Android Developer
* msalihkarakasli - Muhammed Salih Karaksli - Android Developer

## Contribution

The only dependencies for development are docker, docker-compose and a text editor.

You can install node modules with following:
```sh
docker run --rm -it -v $PWD/api:/opt/app -w /opt/app node:9-alpine yarn
```

After that you can simply run all services for server with:
```sh
docker-compose up -d
```

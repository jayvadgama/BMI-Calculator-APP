#!/bin/bash

sudo apt update -y
sudo apt install ufw -y
sudo apt install  nginx -y
sudo ufw app list
sudo ufw allow 'Nginx HTTP'

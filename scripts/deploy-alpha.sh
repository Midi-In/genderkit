#!/bin/sh

# Before running this script you must have installed the AWS CLI.
# On ubuntu, do:
# 1) sudo apt-get install python-pip python-dev build-essential 
# 2) pip install --upgrade --user awscli
# 3) Set up the AWS credentials using aws configure

cd /vagrant
mkdir live
cd live
git clone git@github.com:genderkit/genderkit.git
cd genderkit
bundle install
bundle exec rake resize
bundle exec jekyll build --config /vagrant/live/genderkit/_config-alpha.yml
bundle exec rake referencelinks
aws s3 sync ./_site/ s3://alpha.genderkit.org.uk/
rm -rv /vagrant/live
#!/bin/bash
# declare an array called array and define 3 vales
array=( 
    "bootstrap/cache"
    "storage/logs"
    "storage/framework/cache/data"
    "storage/framework/sessions"
    "storage/framework/testing"
    "storage/framework/views")
for i in "${array[@]}"
do
	mkdir -p "$i"
done
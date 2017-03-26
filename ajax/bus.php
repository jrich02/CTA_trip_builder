<?php
$apiKey = "key=eJUH5k4Qkb7EapXS4udaPSuGt";
$params = "&format=json";

$url = "http://ctabustracker.com/bustime/api/v2/gettime?$apiKey$params";

$ch = curl_init();
curl_setopt($ch,CURLOPT_URL,$url);
curl_setopt($ch, CURLOPT_VERBOSE, 1);
curl_setopt($ch, CURLOPT_NOBODY, 0);    
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch,CURLOPT_HEADER,0);
$result=curl_exec($ch);
var_dump($result);
return $result;
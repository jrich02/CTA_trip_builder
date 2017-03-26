<?php
$apiKey = "key=8832a51e6a514642ba4a6e3125ee3c74";
$params = "&outputType=JSON";

$url = "http://lapi.transitchicago.com/api/1.0/?$apiKey$params";
echo $url;die;
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

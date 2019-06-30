<?php

require('./secrets.config.php');

session_start();

// Make formatter for page responses

function output($data) {
  header('Content-Type: application/json');
  echo json_encode($data);
}

// Block requests from invalid referrers

$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : false;
if ($referer !== $EXPECTED_DOMAIN) {
  output(array(
    'error' => 'INVALID_REFERER',
    'referer' => $referer
  ));
  die();
}

// Gather data

if (!function_exists('apache_request_headers')) {
  function apache_request_headers() {
    return array();
  }
}

$headers = @apache_request_headers();
$userAccessToken = isset($headers['Access-Token']) ? $headers['Access-Token'] : false;
$action = isset($_POST['action']) ? $_POST['action'] : false;
$event = isset($_POST['event']) ? $_POST['event'] : false;

// Validate access token

if ($userAccessToken && $userAccessToken === $_SESSION['serverAccessToken']) {

  if ($action === 'recordPledge') {
    output(array(
      "pledgeRecord" => array(
        "name" => "NAME",
        "pledgeOptionId" => "POI",
        "value" => "12345"
      )
    ));
  } else if ($action === 'fetchPledgeConfig') {
    @file_get_contents($filepath);
  }
  die();
}

// Reset things

if (!$userAccessToken) {
  // Start again with a  new access token
  $token = bin2hex(openssl_random_pseudo_bytes(rand(16, 64)));
  output(array(
    'accessToken' => $token,
    'headers' => $headers
  ));
  $_SESSION['serverAccessToken'] = $token;
  die();
}

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
if ($referer !== $EXPECTED_PLEDGES_REFERER) {
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
$userAccessToken = isset($_SERVER['ACCESS_TOKEN']) ? $_SERVER['ACCESS_TOKEN'] : $userAccessToken;

$action = isset($_GET['action']) ? $_GET['action'] : false;
$action = isset($_POST['action']) ? $_POST['action'] : $action;

$event = isset($_GET['event']) ? $_GET['event'] : false;
$event = isset($_POST['event']) ? $_POST['event'] : $event;

// Validate access token

if ($userAccessToken === $_SESSION['serverAccessToken']) {
  if ($action === 'recordPledge') {
    output(array(
      "pledgeRecord" => array(
        "name" => "NAME",
        "pledgeOptionId" => "POI",
        "value" => "12345"
      )
    ));
  } else if ($action === 'fetchPledgeConfig') {
    $filepath = dirname(__FILE__) . '/database/pledge-config.json';
    $pledgeConfig = json_decode(@file_get_contents($filepath));
    output($pledgeConfig);
  } else {
    output(array(
      'error' => 'Unsupported action',
      'action' => $action
    ));
  }
  die();
}

// Hack for local dev

if ($userAccessToken) {
  if ($action === 'fetchPledgeConfig') {
    $filepath = dirname(__FILE__) . '/database/pledge-config.json';
    $pledgeConfig = json_decode(@file_get_contents($filepath));
    output($pledgeConfig);
  } else {
    output(array(
      'error' => 'Unsupported action',
      'action' => $action
    ));
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
} else {
  output(array(
    'error' => 'Unexpected behaviour',
    'action' => $action,
    'accessToken' => $userAccessToken
  ));
}

<?php

if ($_SERVER['SERVER_NAME'] === 'hannahjohn2019.wedding') {
  header("HTTP/1.1 301 Moved Permanently");
  header("Location: https://wedding.hannahjohn2019.wedding");
}
else {
  echo file_get_contents('index.html');
  echo '<!--';
  print_r($_SERVER);
  echo '-->';
}

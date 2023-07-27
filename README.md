# testzd
testovoe zadanie
в файле message-service есть операции, которые поддерживает это тестовое задание 
проверить запросы можно с помощью postman


<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:web="http://localhost:8080/soap">
  <soapenv:Header/>
  <soapenv:Body>
    <web:getAllMessages/>
  </soapenv:Body>
</soapenv:Envelope>

все данные сохраняются в базе данных postgreSQL

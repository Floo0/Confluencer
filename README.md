# Confluencer
Server for docker environment running neo4j as database and niginx to host Confluencer website. Confluencer helps to manage confluence spaces through great visual representation.

## Forward Port (to Confluence)
sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8090  
sudo iptables -I INPUT -p tcp --dport 8090 -j ACCEPT

## Confluence
* To start/stop service, see: https://confluence.atlassian.com/doc/start-and-stop-confluence-838416264.html
    * $ sudo /etc/init.d/confluence start
    * $ sudo /etc/init.d/confluence stop
    * $ sudo /etc/init.d/confluence restart
* Confluence as docker service needs a new license (server version not supported anymore, cloud only?)
